import { TaskManager } from "./task-manager";
import { WorkflowEngine } from "./workflow/engine";
import { ApprovalSystem } from "./approval/system";
import { AuditLogger } from "./audit/logger";
import { RiskAnalyzer } from "./intake/risk-analyzer";
import { PolicyInjector } from "./policy/injector";
export const AIWorkAgentPlugin = async (context) => {
    const { client, project, $, directory } = context;
    // Initialize core systems
    const taskManager = new TaskManager();
    const workflowEngine = new WorkflowEngine();
    const approvalSystem = new ApprovalSystem(client);
    const auditLogger = new AuditLogger();
    const riskAnalyzer = new RiskAnalyzer();
    const policyInjector = new PolicyInjector();
    console.log("[AI Work Agent] Plugin initialized");
    return {
        // Hook: When a new message is received
        "chat.message": async (input, output) => {
            // Analyze if this is a work automation request
            const isWorkRequest = analyzeWorkRequest(input.message);
            if (isWorkRequest) {
                // Inject policy context
                const context = await policyInjector.getContext(input.message);
                // Add system prompt for work automation
                output.systemPrompt = `
You are an AI Work Automation Agent. Help the user with their work tasks.
Current context: ${context}

Available capabilities:
- Generate meeting minutes and reports
- Draft emails and announcements
- Extract action items and schedules
- Analyze data and create charts
- Review for compliance and security

Always follow security policies and request approval for external communications.
        `.trim();
            }
        },
        // Hook: Before tool execution
        "tool.execute.before": async (input, output) => {
            const { tool, params } = input;
            // Log the tool execution attempt
            await auditLogger.logToolAttempt(tool, params);
            // Check if approval is needed
            if (requiresApproval(tool, params)) {
                const approved = await approvalSystem.requestApproval(tool, params);
                if (!approved) {
                    output.blocked = true;
                    output.reason = "Approval required but not granted";
                    return;
                }
            }
            // Apply policy rules
            const modifiedParams = await policyInjector.applyRules(tool, params);
            output.params = modifiedParams;
        },
        // Hook: After tool execution
        "tool.execute.after": async (input, output) => {
            const { tool, params, result } = input;
            // Log the result
            await auditLogger.logToolResult(tool, params, result);
            // Analyze output for risks
            const risks = riskAnalyzer.analyzeOutput(result);
            if (risks.length > 0) {
                output.warnings = risks.map(r => `[${r.type}] ${r.description}`);
            }
        },
        // Hook: Permission requests
        "permission.ask": async (input, output) => {
            const { permission, resource } = input;
            // Add risk context to permission request
            const riskLevel = riskAnalyzer.assessPermissionRisk(permission, resource);
            output.context = {
                riskLevel,
                justification: `This action requires ${permission} access to ${resource}`,
                alternatives: generateAlternatives(permission, resource),
            };
        },
        // Hook: File operations
        "file.save": async (input, output) => {
            const { path, content } = input;
            // Analyze content before saving
            const risks = riskAnalyzer.analyzeContent(content);
            if (risks.some(r => r.level === "high" || r.level === "critical")) {
                const confirmed = await client.session.confirm({
                    message: `High risk content detected: ${risks.map(r => r.description).join(", ")}`,
                    detail: "Do you want to proceed with saving this file?",
                });
                if (!confirmed) {
                    output.cancelled = true;
                    return;
                }
            }
            // Log file save operation
            await auditLogger.logFileOperation("save", path, risks);
        },
        // Hook: Configuration
        config: async (config) => {
            // Add plugin-specific configuration
            config.aiWorkAgent = {
                enabled: true,
                autoApproveLowRisk: false,
                requireApprovalFor: ["external_email", "file_share", "schedule_create"],
                auditLogEnabled: true,
                maxRetries: 3,
            };
        },
        // Hook: Session start
        "session.start": async () => {
            console.log("[AI Work Agent] Session started");
            await auditLogger.logSessionStart();
        },
        // Hook: Session end
        "session.end": async () => {
            console.log("[AI Work Agent] Session ended");
            await auditLogger.logSessionEnd();
        },
    };
};
// Helper functions
function analyzeWorkRequest(message) {
    const workKeywords = [
        "회의록", "meeting", "메일", "email", "보고서", "report",
        "일정", "schedule", "문서", "document", "공지", "notice",
        "작성", "draft", "생성", "create", "분석", "analyze"
    ];
    const lowerMessage = message.toLowerCase();
    return workKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
}
function requiresApproval(tool, params) {
    const highRiskTools = [
        "send_email", "share_file", "publish", "deploy",
        "delete", "update", "modify"
    ];
    return highRiskTools.some(t => tool.toLowerCase().includes(t));
}
function generateAlternatives(permission, resource) {
    const alternatives = [];
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
export default AIWorkAgentPlugin;
//# sourceMappingURL=index.js.map