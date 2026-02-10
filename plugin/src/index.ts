import type { Plugin } from "./types/opencode";
import { TaskManager, WorkRequest } from "./tasks/TaskManager";
import { WorkflowEngine } from "./workflow/engine";
import { ApprovalSystem } from "./approval/system";
import { AuditLogger } from "./audit/logger";
import { DebugLogger } from "./audit/debug-logger";
import { RiskAnalyzer } from "./intake/risk-analyzer";
import { PolicyInjector } from "./policy/injector";
import { ContextCollector } from "./context/ContextCollector";

export const AIWorkAgentPlugin: Plugin = async (context) => {
  const { client, project } = context;
  const directory = project.root;

  const debugLogger = DebugLogger.getInstance();
  const auditLogger = new AuditLogger();
  const taskManager = new TaskManager();
  const workflowEngine = new WorkflowEngine();
  const approvalSystem = new ApprovalSystem(client);
  const riskAnalyzer = new RiskAnalyzer();
  const policyInjector = new PolicyInjector();
  const contextCollector = new ContextCollector(directory, debugLogger);

  debugLogger.log("[AI Work Agent] Plugin initialized", { directory, project });
  debugLogger.log("Client properties", { keys: Object.keys(client) });
  if (client.session) {
    debugLogger.log("Client.session properties", { keys: Object.keys(client.session) });
  }

  await auditLogger.log("PLUGIN_INIT", { directory, project });

  return {
    event: async (payload: any) => {
      if (payload && payload.event) {
        const eventType = payload.event.type;
        const ev = payload.event;

        debugLogger.log(`[HOOK: event] Type: ${eventType}`, {
          type: eventType,
          keys: Object.keys(payload.event)
        });

        if (eventType && (eventType.includes("message") || eventType.includes("chat"))) {
          debugLogger.log("Message Event Details", { event: payload.event });
        }

        if (eventType === "message.part.updated") {
          const part = ev?.properties?.part;
          if (part?.type === "text" && typeof part.text === "string" && part.text.trim()) {
            debugLogger.log("[ROUTED] Text part detected", { text: part.text });
            const output = {};
            await handleMessage(
              { message: part.text },
              output,
              debugLogger,
              auditLogger,
              policyInjector,
              taskManager
            );
            return;
          }
        }
      } else {
        debugLogger.log("[HOOK: event] Unknown payload", { keys: Object.keys(payload || {}) });
      }
    },

    "message.created": async (input: any, output: any) => {
      debugLogger.log("[HOOK: message.created] CALLED", { keys: Object.keys(input) });
      await handleMessage(input, output, debugLogger, auditLogger, policyInjector, taskManager);
    },

    "chat.message": async (input: any, output: any) => {
      debugLogger.log("[HOOK: chat.message] CALLED - DEACTIVATED (system event, not user message)", { keys: Object.keys(input) });
      return;
    },

    "message.part.updated": async (input: any, output: any) => {
      debugLogger.log("[HOOK: message.part.updated] CALLED", { keys: Object.keys(input) });
      
      const part =
        input?.event?.properties?.part ||
        input?.properties?.part ||
        input?.part;

      if (part?.type === "text" && typeof part.text === "string" && part.text.trim()) {
        debugLogger.log("Text part detected", { text: part.text });
        await handleMessage(
          { message: part.text },
          output,
          debugLogger,
          auditLogger,
          policyInjector, taskManager
        );
      } else {
        debugLogger.log("No text part found", { part });
      }
    },

    "experimental.chat.messages.transform": async (
      input: Record<string, never>,
      output: { messages: Array<{ info?: any; parts: any[]; role?: string }> }
    ) => {
      debugLogger.log("[HOOK] experimental.chat.messages.transform CALLED");

      if (output && Array.isArray(output.messages)) {
        const policyContext = `
You are an AI Work Automation Agent.
Your primary goal is to assist the user with work-related tasks such as:
- Generating meeting minutes and reports
- Drafting emails and announcements
- Extracting action items and schedules
- Analyzing data and creating charts

Always follow these rules:
1. If a task involves high-risk actions (email, file share), expect an approval request.
2. Extract key information before performing actions.
3. Use available tools efficiently.
        `.trim();

        const systemMsgIndex = output.messages.findIndex(m => m.info?.role === "system" || m.role === "system");

        if (systemMsgIndex >= 0) {
          const existingContent = output.messages[systemMsgIndex].parts.map(p => p.text).join("");
          if (!existingContent.includes("AI Work Automation Agent")) {
             output.messages[systemMsgIndex].parts.push({ type: "text", text: "\n\n" + policyContext });
             debugLogger.log("Policy INJECTED into existing system message");
          }
        } else {
          output.messages.unshift({
            info: { role: "system" },
            parts: [{ type: "text", text: policyContext }]
          } as any);
          debugLogger.log("Policy INJECTED as new system message");
        }
      }
    },

    "tool.execute.before": async (input, output) => {
      const { tool, params } = input;
      debugLogger.log("[HOOK: tool.execute.before] START", { tool, params });

      await auditLogger.logToolAttempt(tool, params);

      const needsApproval = requiresApproval(tool, params, debugLogger);
      debugLogger.log("Approval check result", { needsApproval });

      if (needsApproval) {
        const approved = await approvalSystem.requestApproval(tool, params);
        debugLogger.log("Approval result", { approved });

        if (!approved) {
          output.blocked = true;
          output.reason = "Approval required but not granted";
          await auditLogger.log("TOOL_BLOCKED", { tool, params, reason: "approval_denied" });
          debugLogger.log("[HOOK: tool.execute.before] BLOCKED");
          return;
        }
      }

      const modifiedParams = await policyInjector.applyRules(tool, params);
      output.params = modifiedParams;

      await auditLogger.log("TOOL_EXECUTE_BEFORE_COMPLETE", { tool, modified: modifiedParams !== params });
      debugLogger.log("[HOOK: tool.execute.before] END");
    },

    "tool.execute.after": async (input, output) => {
      const { tool, params, result } = input;
      debugLogger.log("[HOOK: tool.execute.after] START", { tool });

      await auditLogger.logToolResult(tool, params, result);

      const risks = riskAnalyzer.analyzeOutput(result);
      debugLogger.log("Risk analysis complete", { riskCount: risks.length });

      if (risks.length > 0) {
        output.warnings = risks.map(r => `[${r.type}] ${r.description}`);
        await auditLogger.log("RISKS_DETECTED", { tool, risks });
      }

      debugLogger.log("[HOOK: tool.execute.after] END");
    },

    "permission.asked": async (input, output) => {
      const { permission, resource } = input;
      debugLogger.log("[HOOK: permission.asked] START", { permission, resource });

      const riskLevel = riskAnalyzer.assessPermissionRisk(permission, resource);
      debugLogger.log("Risk level assessed", { riskLevel });

      output.context = {
        riskLevel,
        justification: `This action requires ${permission} access to ${resource}`,
        alternatives: generateAlternatives(permission, resource),
      };

      await auditLogger.log("PERMISSION_REQUEST", { permission, resource, riskLevel });
      debugLogger.log("[HOOK: permission.asked] END");
    },

    "file.written": async (input, output) => {
      const { path, content } = input;
      debugLogger.log("[HOOK: file.written] START", { path, contentSize: content?.length || 0 });

      const risks = riskAnalyzer.analyzeContent(content);
      debugLogger.log("Content analysis complete", { riskCount: risks.length });

      const highRiskRisks = risks.filter(r => r.level === "high" || r.level === "critical");
      if (highRiskRisks.length > 0) {
        debugLogger.log("High risk detected", { risks: highRiskRisks.map(r => r.description) });
        const confirmed = await client.session.confirm({
          message: `High risk content detected: ${highRiskRisks.map(r => r.description).join(", ")}`,
          detail: "Do you want to proceed with saving this file?",
        });

        if (!confirmed) {
          output.cancelled = true;
          await auditLogger.log("FILE_SAVE_CANCELLED", { path, risks });
          debugLogger.log("[HOOK: file.written] CANCELLED");
          return;
        }
      }

      await auditLogger.logFileOperation("save", path, risks);
      debugLogger.log("[HOOK: file.written] END");
    },

    config: async (config) => {
      config.aiWorkAgent = {
        enabled: true,
        autoApproveLowRisk: false,
        requireApprovalFor: ["external_email", "file_share", "schedule_create"],
        auditLogEnabled: true,
        maxRetries: 3,
      };

      await auditLogger.log("CONFIG_APPLIED", config.aiWorkAgent);
      debugLogger.log("[HOOK: config] END", config.aiWorkAgent);
    },

    "session.created": async () => {
      await auditLogger.logSessionStart();
      debugLogger.log("[HOOK: session.created]");
      
      try {
        const projectSummary = await contextCollector.getProjectSummary();
        debugLogger.log("Project context collected on session start", { summaryLength: projectSummary.length });
        await auditLogger.log("PROJECT_CONTEXT_COLLECTED", { 
          directory,
          summaryLength: projectSummary.length 
        });
      } catch (error) {
        debugLogger.log("Failed to collect project context", { error: error instanceof Error ? error.message : String(error) });
      }
    },

    "session.deleted": async () => {
      await auditLogger.logSessionEnd();
      debugLogger.log("[HOOK: session.deleted]");
    },
  };
};

// Helper functions
function analyzeWorkRequest(message: string, logger?: DebugLogger): boolean {
  if (!message || typeof message !== "string") {
    logger?.log("Message is null/undefined or not a string");
    return false;
  }

  const workKeywords = [
    "회의록", "meeting", "메일", "email", "보고서", "report",
    "일정", "schedule", "문서", "document", "공지", "notice",
    "작성", "draft", "생성", "create", "분석", "analyze",
  ];

  const lowerMessage = message.toLowerCase();
  const matched = workKeywords.filter(keyword => lowerMessage.includes(keyword.toLowerCase()));

  if (matched.length > 0) {
    logger?.log("Matched keywords", { keywords: matched });
  }

  return matched.length > 0;
}

function requiresApproval(tool: string, params: any, logger?: DebugLogger): boolean {
  if (!tool || typeof tool !== 'string') return false;

  const highRiskTools = [
    "send_email", "share_file", "publish", "deploy",
    "delete", "update", "modify",
  ];

  const requires = highRiskTools.some(t => tool.toLowerCase().includes(t));
  if (requires) {
    logger?.log("High-risk tool detected", { tool });
  }
  return requires;
}

function extractKeywords(message: string): string[] {
  const workKeywords = [
    "회의록", "meeting", "메일", "email", "보고서", "report",
    "일정", "schedule", "문서", "document", "공지", "notice",
    "작성", "draft", "생성", "create", "분석", "analyze",
  ];

  const lowerMessage = message.toLowerCase();
  return workKeywords.filter(keyword => lowerMessage.includes(keyword.toLowerCase()));
}

function suggestActions(message: string): string[] {
  const actions: string[] = [];
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("회의") || lowerMessage.includes("meeting")) {
    actions.push("create_meeting_minutes");
  }
  
  if (lowerMessage.includes("메일") || lowerMessage.includes("email")) {
    actions.push("draft_email");
  }
  
  if (lowerMessage.includes("요약") || lowerMessage.includes("정리") || lowerMessage.includes("summary")) {
    actions.push("summarize_discussion");
  }

  return actions;
}

function generateAlternatives(permission: string, resource: string): string[] {
  const alternatives: string[] = [];
  
  if (permission.includes("write") || permission.includes("modify")) {
    alternatives.push("Create a draft instead");
    alternatives.push("Save to a temporary location");
  }
  
  if (permission.includes("external")) {
    alternatives.push("Send for internal review first");
    alternatives.push("Create a summary version");
  }
  
  return alternatives;
}

// New helper to handle message processing across different hooks
async function handleMessage(
  input: any,
  output: any,
  debugLogger: DebugLogger,
  auditLogger: AuditLogger,
  policyInjector: PolicyInjector,
  taskManager: TaskManager
) {
  debugLogger.log("FULL INPUT DUMP", { input });

  const messageContent = input.message || 
                        input.content || 
                        input.text || 
                        (input.message && input.message.content) || 
                        input.body || 
                        input.query || 
                        input.prompt || "";

  debugLogger.log("1111111111111111111111111111111111111111111111");
  debugLogger.log(messageContent);
  
  if (!messageContent) {
    debugLogger.log("Resolved message is empty, skipping further processing.");
    return;
  }

  if (taskManager) {
    try {
      const workRequest: WorkRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: "user",
        content: messageContent,
        timestamp: new Date(),
        analysis: {
          isWorkRelated: true,
          confidence: 0.8,
          riskLevel: "medium",
          keywords: extractKeywords(messageContent),
          entities: [],
          potentialActions: suggestActions(messageContent)
        }
      };

      const task = await taskManager.createTask(workRequest);
      debugLogger.log("Task created successfully", { taskId: task.id, taskType: task.type });

      const contextStart = Date.now();
      const policyContext = await policyInjector.getContext(messageContent);
      debugLogger.log("Policy context retrieved", { duration: Date.now() - contextStart });

      if (output && typeof output === "object") {
         (output as any).systemPrompt = `
You are an AI Work Automation Agent. Help the user with their work tasks.
Current context: ${policyContext}

Task created: ${task.id} (${task.type})
Available tools: ${taskManager.getAvailableTools().map(t => t.name).join(", ")}

Available capabilities:
- Generate meeting minutes and reports
- Draft emails and announcements
- Extract action items and schedules
- Analyze data and create charts
- Review for compliance and security

Always follow security policies and request approval for external communications.
        `.trim();
      }

      await auditLogger.log("WORK_REQUEST_DETECTED", {
        message: messageContent,
        contextInjected: true,
        taskId: task.id,
        taskType: task.type
      });
    } catch (error) {
      debugLogger.log("Failed to create task", { error: error instanceof Error ? error.message : String(error) });
      await auditLogger.log("TASK_CREATION_FAILED", {
        message: messageContent,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  } 
}

export default AIWorkAgentPlugin;
