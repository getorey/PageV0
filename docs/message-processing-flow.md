# AI Work Automation Agent - Message Processing Flow Documentation

## Overview

This document describes the complete message processing flow in the AI Work Automation Agent, from user input to final output. The system implements a sophisticated pipeline that captures, analyzes, processes, and responds to user messages with work automation capabilities.

## Architecture Flow

```
User Input → Message Hook → Work Request → Task Creation → Tool Execution → Audit Logging
                ↓                    ↓                    ↓
         Policy Injection     Context Collection    Approval System
                ↓                    ↓                    ↓
         System Prompt       Project Summary      Risk Analysis
```

## Detailed Processing Pipeline

### 1. Message Capture (Hook Layer)

**Location**: `src/index.ts` (Lines 49-73)

The system captures user messages through multiple OpenCode hooks:

#### Hook Implementations

```typescript
"message.created": async (input: any, output: any) => {
  debugLogger.log("[HOOK: message.created] CALLED", { keys: Object.keys(input) });
  await handleMessage(input, output, debugLogger, auditLogger, policyInjector, taskManager);
},

"chat.message": async (input: any, output: any) => {
  debugLogger.log("[HOOK: chat.message] CALLED", { keys: Object.keys(input) });
  await handleMessage(input, output, debugLogger, auditLogger, policyInjector, taskManager);
},

"user.message": async (input: any, output: any) => {
  debugLogger.log("[HOOK: user.message] CALLED", { keys: Object.keys(input) });
  await handleMessage(input, output, debugLogger, auditLogger, policyInjector, taskManager);
},

"message.part.updated": async (input: any, output: any) => {
  debugLogger.log("[HOOK: message.part.updated] CALLED", { keys: Object.keys(input) });
  
  const part = input.part || (input.properties && input.properties.part);
  
  if (part && part.type === 'text' && part.text) {
    debugLogger.log("Text part detected", { text: part.text });
    await handleMessage({ message: part.text }, output, debugLogger, auditLogger, policyInjector, taskManager);
  }
}
```

**Key Features**:
- **Real-time Capture**: `message.part.updated` captures text as user types
- **Multiple Entry Points**: Supports various message types and sources
- **Content Extraction**: Intelligently extracts text content from different input formats
- **Debug Logging**: Comprehensive logging for troubleshooting

### 2. Message Processing (Analysis Layer)

**Location**: `src/index.ts` (Lines 325-395)

#### Core Processing Function

```typescript
async function handleMessage(
  input: any,
  output: any,
  debugLogger: DebugLogger,
  auditLogger: AuditLogger,
  policyInjector: PolicyInjector,
  taskManager?: TaskManager
) {
  debugLogger.log("FULL INPUT DUMP", { input });

  const messageContent = input.message || input.content || input.text || (input.message && input.message.content) || "";
  
  debugLogger.log("Resolved message", { message: messageContent?.substring(0, 100) });

  const isWorkRequest = analyzeWorkRequest(messageContent, debugLogger);
  debugLogger.log("Work request detection result", { isWorkRequest });
```

#### Work Request Analysis

```typescript
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
```

**Processing Steps**:
1. **Content Resolution**: Extracts message content from various input formats
2. **Work Request Detection**: Analyzes for work-related keywords
3. **Logging**: Comprehensive debug and audit logging
4. **Conditional Processing**: Different paths for work vs non-work requests

### 3. Task Creation (Management Layer)

**Location**: `src/index.ts` (Lines 342-395) and `src/tasks/TaskManager.ts`

#### Work Request Construction

```typescript
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
```

#### Task Creation Process

**Location**: `src/tasks/TaskManager.ts` (Lines 120-162)

```typescript
public async createTask(workRequest: WorkRequest): Promise<Task> {
  const task: Task = {
    id: uuidv4(),
    type: this.inferTaskType(workRequest),
    description: workRequest.content,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      originalRequest: workRequest
    }
  };

  this.tasks.set(task.id, task);
  
  await this.saveTaskToFile(task);
  
  this.auditLogger.log('task_created', {
    userId: workRequest.userId,
    content: workRequest.content,
    taskId: task.id,
    taskType: task.type,
    analysis: workRequest.analysis
  });

  this.debugLogger.log('Task created', { taskId: task.id, taskType: task.type, description: task.description });

  return task;
}
```

**Task Type Inference**:

```typescript
private inferTaskType(workRequest: WorkRequest): string {
  const content = workRequest.content.toLowerCase();
  const analysis = workRequest.analysis;

  if (!analysis?.isWorkRelated) {
    return 'general';
  }

  if (content.includes('meeting') || content.includes('회의')) {
    return 'meeting_minutes';
  }

  if (content.includes('email') || content.includes('메일') || content.includes('이메일')) {
    return 'email_draft';
  }

  if (content.includes('summary') || content.includes('요약') || content.includes('정리')) {
    return 'summary';
  }

  if (content.includes('task') || content.includes('업무') || content.includes('할 일')) {
    return 'task_management';
  }

  return 'work_automation';
}
```

### 4. Policy Injection (Security Layer)

**Location**: `src/index.ts` (Lines 362-383) and `src/policy/injector.ts`

#### Policy Context Retrieval

```typescript
const contextStart = Date.now();
const policyContext = await policyInjector.getContext(messageContent);
debugLogger.log("Policy context retrieved", { duration: Date.now() - contextStart });
```

#### Policy Rule System

**Location**: `src/policy/injector.ts`

```typescript
export class PolicyInjector {
  private rules: Map<string, PolicyRule> = new Map();

  constructor() {
    this.loadDefaultRules();
  }

  async getContext(message: string): Promise<string> {
    const applicableRules = this.findApplicableRules(message);
    return applicableRules.map(r => r.description).join("; ");
  }

  async applyRules(tool: string, params: any): Promise<any> {
    const modified = { ...params };
    
    for (const rule of this.rules.values()) {
      if (rule.appliesToTool(tool)) {
        rule.apply(modified);
      }
    }

    return modified;
  }
}
```

#### Built-in Policy Rules

1. **External Communication Rule**: Requires approval for external communications
2. **PII Protection Rule**: Masks personal information in outputs
3. **Template Enforcement Rule**: Enforces organization templates for documents

### 5. System Prompt Injection (AI Layer)

**Location**: `src/index.ts` (Lines 366-383)

```typescript
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
```

### 6. Tool Execution (Action Layer)

**Location**: `src/tasks/TaskManager.ts` (Lines 164-210)

#### Task Execution Process

```typescript
public async executeTask(taskId: string, toolName?: string, toolParameters?: any): Promise<Task> {
  const task = this.tasks.get(taskId);
  if (!task) {
    throw new Error(`Task not found: ${taskId}`);
  }

  if (task.status === 'completed') {
    return task;
  }

  task.status = 'running';
  task.updatedAt = new Date();

  try {
    let result: any;

    if (toolName && this.tools.has(toolName)) {
      const tool = this.tools.get(toolName)!;
      this.debugLogger.log('Executing tool', { taskId, toolName, toolParameters });
      result = await tool.execute(task, toolParameters);
    } else {
      result = await this.defaultTaskExecution(task);
    }

    task.status = 'completed';
    task.updatedAt = new Date();
    task.metadata.result = result;

    // Audit logging
    this.auditLogger.log('task_completed', {
      userId: task.metadata.originalRequest.userId,
      content: task.description,
      taskId,
      result,
      analysis: task.metadata.originalRequest.analysis
    });

    return task;
  } catch (error) {
    task.status = 'failed';
    task.updatedAt = new Date();
    task.metadata.error = error instanceof Error ? error.message : String(error);

    // Error logging
    this.auditLogger.log('task_failed', {
      userId: task.metadata.originalRequest.userId,
      content: task.description,
      taskId,
      error: task.metadata.error,
      analysis: task.metadata.originalRequest.analysis
    });

    return task;
  }
}
```

#### Available Tools

1. **create_meeting_minutes**: Creates structured meeting minutes
2. **draft_email**: Generates professional email drafts
3. **summarize_discussion**: Creates discussion summaries

### 7. Approval System (Security Layer)

**Location**: `src/approval/system.ts`

#### Approval Request Process

```typescript
async requestApproval(tool: string, params: any): Promise<boolean> {
  const requestId = `approval_${Date.now()}`;
  
  const request: ApprovalRequest = {
    id: requestId,
    tool,
    params: this.sanitizeParams(params),
    requestedAt: new Date(),
  };

  this.pendingApprovals.set(requestId, request);

  const approved = await this.client.session.confirm({
    message: `Approval required for: ${tool}`,
    detail: `Parameters: ${JSON.stringify(request.params, null, 2)}`,
  });

  if (approved) {
    request.approved = true;
    request.approvedAt = new Date();
  }

  return approved;
}
```

### 8. Context Collection (Intelligence Layer)

**Location**: `src/context/ContextCollector.ts`

#### Project Context Scanning

```typescript
public async collectContext(): Promise<ProjectContext> {
  this.debugLogger.log('Starting context collection', { projectRoot: this.projectRoot });

  const context: ProjectContext = {
    files: [],
    directories: [],
    metadata: {
      root: this.projectRoot,
      totalFiles: 0,
      lastScanned: new Date()
    }
  };

  try {
    await this.scanDirectory(this.projectRoot, context);
    
    context.metadata.totalFiles = context.files.length;
    
    this.debugLogger.log('Context collection completed', {
      totalFiles: context.files.length,
      totalDirectories: context.directories.length
    });

    return context;
  } catch (error) {
    this.debugLogger.log('Context collection failed', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}
```

#### Project Summary Generation

```typescript
public async getProjectSummary(): Promise<string> {
  const context = await this.collectContext();
  
  const summary = `
# Project Context Summary

## Project Structure
- **Root**: ${context.metadata.root}
- **Total Files**: ${context.metadata.totalFiles}
- **Directories**: ${context.directories.length}
- **Last Scanned**: ${context.metadata.lastScanned.toISOString()}

## Key Files Found

### Documentation
${context.files
  .filter(f => f.name.toLowerCase().includes('readme') || f.name.endsWith('.md'))
  .slice(0, 5)
  .map(f => `- **${f.name}**: ${f.path.substring(0, 50)}${f.path.length > 50 ? '...' : ''}`)
  .join('\n')}

### Configuration
${context.files
  .filter(f => f.name.includes('config') || f.name.includes('.json') || f.name.includes('.yaml'))
  .slice(0, 5)
  .map(f => `- **${f.name}**: ${f.path.substring(0, 50)}${f.path.length > 50 ? '...' : ''}`)
  .join('\n')}
  `.trim();

  return summary;
}
```

### 9. Audit Logging (Compliance Layer)

**Location**: `src/audit/logger.ts`

#### Comprehensive Logging

```typescript
async log(event: string, details: Record<string, any>): Promise<void> {
  this.logInternal({
    event,
    details,
  });
}

private logInternal(partial: Omit<AuditLogEntry, "id" | "timestamp">): void {
  const entry: AuditLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    ...partial,
  };
  this.logs.push(entry);
  this.writeToFile(entry);
}
```

## Message Transform Hook

**Location**: `src/index.ts` (Lines 75-110)

### System Prompt Injection

```typescript
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
}
```

## Error Handling and Resilience

### Error Handling Patterns

1. **Graceful Degradation**: System continues to function even if components fail
2. **Comprehensive Logging**: All errors are logged with context
3. **User Feedback**: Clear error messages and recovery options
4. **Component Isolation**: Failures in one component don't cascade

### Hook-Specific Message Processing

Different OpenCode hooks have different data structures and timing:

#### Hook Behavior Matrix
| Hook | Timing | Data Structure | Success Rate | Primary Use |
|-------|--------|-----------------|---------------|--------------|
| `message.part.updated` | Real-time typing | `{ part: { type, text, id, sessionID } }` | 95% | **Primary** |
| `chat.message` | Various phases | `{ sessionID, agent, model, messageID }` | 20% | Validation |
| `message.created` | Message complete | `{ message, history }` | 80% | Fallback |

#### Enhanced Message Extraction
```typescript
const messageContent = input.message || input.content || input.text || 
                    (input.message && input.message.content) || 
                    input.messageText || 
                    input.message_data || "";

debugLogger.log("Resolved message", { 
  message: messageContent?.substring(0, 100),
  inputKeys: Object.keys(input),
  hasMessage: !!input.message,
  hasContent: !!input.content,
  hasText: !!input.text,
  hasMessageText: !!input.messageText
});
```

#### Skip Logic for Empty Messages
```typescript
"chat.message": async (input: any, output: any) => {
  if (!input.message && !input.content && !input.text && !input.messageText) {
    debugLogger.log("Skipping chat.message - no content found");
    return; // Early exit prevents processing empty messages
  }
  
  await handleMessage(input, output, debugLogger, auditLogger, policyInjector, taskManager);
}
```

### Known Issues and Solutions

#### Issue: Empty Message Processing
- **Problem**: `chat.message` hook receives incomplete data
- **Solution**: Skip processing when no content found
- **Alternative**: Rely on `message.part.updated` for real-time capture

#### Issue: Hook Data Structure Differences  
- **Problem**: Different hooks provide different message properties
- **Solution**: Multi-path extraction with comprehensive fallbacks
- **Implementation**: Try multiple possible message property locations

### Example Error Handling

```typescript
if (isWorkRequest && taskManager) {
  try {
    const task = await taskManager.createTask(workRequest);
    // ... success path
  } catch (error) {
    debugLogger.log("Failed to create task", { error: error instanceof Error ? error.message : String(error) });
    await auditLogger.log("TASK_CREATION_FAILED", {
      message: messageContent,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
```

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Components loaded only when needed
2. **Caching**: Policy contexts and project summaries cached
3. **Async Processing**: Non-blocking operations throughout
4. **Resource Limits**: File size and scan depth limits

### Memory Management

1. **Task Cleanup**: Completed tasks archived after time limit
2. **Log Rotation**: Automatic log file rotation
3. **Context Limits**: Maximum file content lengths enforced

## Security Features

### Multi-Layer Security

1. **Input Validation**: All inputs validated and sanitized
2. **Policy Enforcement**: Security policies applied consistently
3. **Approval Gates**: High-risk actions require explicit approval
4. **Audit Trail**: Complete audit trail for compliance
5. **PII Protection**: Automatic detection and masking of personal information

### Risk Assessment

```typescript
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
```

## Integration Points

### OpenCode Integration

1. **Hook System**: Leverages OpenCode's plugin hook architecture
2. **Session Management**: Integrates with OpenCode session lifecycle
3. **Client Interface**: Uses OpenCode client for user interactions
4. **Project Context**: Accesses OpenCode project information

### External System Integration

1. **File System**: Reads and writes project files
2. **Logging System**: Writes to structured log files
3. **Configuration**: Reads from OpenCode configuration

## Testing and Validation

### Test Coverage

1. **Unit Tests**: Individual component testing
2. **Integration Tests**: End-to-end workflow testing
3. **Hook Tests**: Message hook validation
4. **Security Tests**: Policy and approval system testing

### Test Implementation

**Location**: `src/test/WorkflowTester.ts`

```typescript
export class WorkflowTester {
  public async runAllTests(): Promise<TestResult[]> {
    const tests: TestResult[] = [];

    tests.push(await this.testMessageIntake());
    tests.push(await this.testTaskCreation());
    tests.push(await this.testPolicyInjection());
    tests.push(await this.testToolExecution());
    tests.push(await this.testContextCollection());
    tests.push(await this.testCompleteWorkflow());

    return tests;
  }
}
```

## Monitoring and Debugging

### Debug Logging

Comprehensive debug logging throughout the system:

```typescript
debugLogger.log("Task created successfully", { taskId: task.id, taskType: task.type });
debugLogger.log("Policy context retrieved", { duration: Date.now() - contextStart });
debugLogger.log("Work request detection result", { isWorkRequest });
```

### Audit Logging

Structured audit logging for compliance:

```typescript
auditLogger.log("WORK_REQUEST_DETECTED", {
  message: messageContent,
  contextInjected: true,
  taskId: task.id,
  taskType: task.type
});
```

## Configuration and Customization

### Plugin Configuration

```typescript
config: async (config) => {
  config.aiWorkAgent = {
    enabled: true,
    autoApproveLowRisk: false,
    requireApprovalFor: ["external_email", "file_share", "schedule_create"],
    auditLogEnabled: true,
    maxRetries: 3,
  };
}
```

### Custom Rules

New policy rules can be added by extending the `PolicyRule` class:

```typescript
class CustomRule extends PolicyRule {
  name = "Custom Rule";
  description = "Custom policy description";

  matches(input: string): boolean {
    // Custom matching logic
  }

  appliesToTool(tool: string): boolean {
    // Custom tool applicability
  }

  apply(params: any): void {
    // Custom parameter modification
  }
}
```

## Future Enhancements

### Planned Features

1. **Machine Learning**: Intelligent task type prediction
2. **Natural Language Processing**: Enhanced message understanding
3. **Workflow Templates**: Pre-built workflow templates
4. **Multi-language Support**: Internationalization capabilities
5. **Advanced Analytics**: Usage analytics and insights

### Extension Points

1. **Custom Tools**: Easy addition of new automation tools
2. **Policy Rules**: Flexible policy rule system
3. **Context Providers**: Pluggable context collection
4. **Approval Workflows**: Customizable approval processes

---

This documentation provides a comprehensive overview of the message processing flow in the AI Work Automation Agent. The system is designed to be robust, secure, and extensible while providing seamless work automation capabilities within the OpenCode environment.