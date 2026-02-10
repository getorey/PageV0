# AI Work Automation Agent - Developer Quick Reference

## 🚀 Quick Start

### Key Files and Their Purposes

| File | Purpose | Key Functions |
|------|---------|--------------|
| `src/index.ts` | Main plugin entry point | Hook handlers, message processing |
| `src/tasks/TaskManager.ts` | Task lifecycle management | `createTask()`, `executeTask()` |
| `src/policy/injector.ts` | Security policy enforcement | `getContext()`, `applyRules()` |
| `src/context/ContextCollector.ts` | Project context awareness | `collectContext()`, `getProjectSummary()` |
| `src/approval/system.ts` | Approval workflow | `requestApproval()` |
| `src/audit/logger.ts` | Comprehensive audit logging | `log()`, specialized logging methods |

## 🔧 Core Processing Flow

### 1. Message Capture
```typescript
// Hook that captures user input in real-time
"message.part.updated": async (input: any, output: any) => {
  const part = input.part || (input.properties && input.properties.part);
  if (part && part.type === 'text' && part.text) {
    await handleMessage({ message: part.text }, output, debugLogger, auditLogger, policyInjector, taskManager);
  }
}
```

### 2. Work Request Detection
```typescript
function analyzeWorkRequest(message: string): boolean {
  const workKeywords = [
    "회의록", "meeting", "메일", "email", "보고서", "report",
    "일정", "schedule", "문서", "document", "공지", "notice",
    "작성", "draft", "생성", "create", "분석", "analyze",
  ];
  return workKeywords.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  );
}
```

### 3. Task Creation
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

const task = await taskManager.createTask(workRequest);
```

### 4. Policy Injection
```typescript
const policyContext = await policyInjector.getContext(messageContent);

(output as any).systemPrompt = `
You are an AI Work Automation Agent. Help the user with their work tasks.
Current context: ${policyContext}
Task created: ${task.id} (${task.type})
Available tools: ${taskManager.getAvailableTools().map(t => t.name).join(", ")}
`;
```

## 🛠️ Available Tools

### Built-in Tools
```typescript
// Meeting Minutes
await taskManager.executeTask(taskId, 'create_meeting_minutes', {
  meetingType: 'weekly',
  attendees: ['Team A', 'Team B'],
  duration: '1 hour'
});

// Email Draft
await taskManager.executeTask(taskId, 'draft_email', {
  recipients: ['user@example.com'],
  subject: 'Meeting Follow-up',
  tone: 'formal'
});

// Discussion Summary
await taskManager.executeTask(taskId, 'summarize_discussion', {
  format: 'bullets',
  includeActions: true
});
```

### Adding Custom Tools
```typescript
taskManager.registerTool({
  name: 'custom_tool',
  description: 'Custom tool description',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'Parameter description' }
    },
    required: ['param1']
  },
  execute: async (task, context) => {
    // Custom logic here
    return { result: 'Custom execution result' };
  }
});
```

## 🔒 Security & Policies

### Built-in Policy Rules
1. **External Communication Rule**: Requires approval for external communications
2. **PII Protection Rule**: Masks personal information
3. **Template Enforcement Rule**: Enforces organization templates

### Adding Custom Policy Rules
```typescript
class CustomRule extends PolicyRule {
  name = "Custom Policy";
  description = "Custom policy description";

  matches(input: string): boolean {
    return input.includes('custom_keyword');
  }

  appliesToTool(tool: string): boolean {
    return tool === 'custom_tool';
  }

  apply(params: any): void {
    params.customFlag = true;
  }
}
```

## 📊 Context Collection

### Project Context Types
```typescript
interface ProjectContext {
  files: {
    name: string;
    path: string;
    content: string;
    size: number;
  }[];
  directories: string[];
  metadata: {
    root: string;
    totalFiles: number;
    lastScanned: Date;
  };
}
```

### Context Filtering
- **File Types**: `.md`, `.json`, `.yaml`, `.js`, `.ts`, `.py`, etc.
- **File Names**: `README`, `package.json`, `tsconfig.json`, etc.
- **Excluded**: `node_modules`, `.git`, `dist`, `coverage`, etc.
- **Size Limit**: 1MB per file, 5KB content preview

## 📝 Audit Logging

### Standard Log Events
```typescript
auditLogger.log('WORK_REQUEST_DETECTED', {
  message: messageContent,
  contextInjected: true,
  taskId: task.id,
  taskType: task.type
});

auditLogger.log('TASK_COMPLETED', {
  userId: task.metadata.originalRequest.userId,
  content: task.description,
  taskId,
  result: task.metadata.result
});
```

### Log Storage
- **Location**: `~/.opencode/logs/ai-work-agent/`
- **Files**: `audit-YYYYMMDD.log`, `debug-YYYYMMDD.log`
- **Rotation**: Automatic at 10MB limit
- **Format**: JSON Lines (one JSON object per line)

## 🎯 Hook System

### Available Hooks
```typescript
return {
  "message.part.updated": async (input, output) => { /* Real-time text capture */ },
  "message.created": async (input, output) => { /* Message creation */ },
  "chat.message": async (input, output) => { /* Chat messages */ },
  "experimental.chat.messages.transform": async (input, output) => { /* Prompt injection */ },
  "tool.execute.before": async (input, output) => { /* Pre-execution checks */ },
  "tool.execute.after": async (input, output) => { /* Post-execution logging */ },
  "permission.asked": async (input, output) => { /* Permission requests */ },
  "file.written": async (input, output) => { /* File operations */ },
  "session.created": async () => { /* Session initialization */ },
  "session.deleted": async () => { /* Session cleanup */ },
  config: async (config) => { /* Plugin configuration */ }
};
```

## 🔍 Testing

### Running Tests
```bash
cd /Users/getorey/Documents/PageV0/plugin
npm run build
node dist/test/run-tests.js
```

### Test Categories
1. **Message Intake**: Hook functionality and message extraction
2. **Task Creation**: Task lifecycle and type inference
3. **Policy Injection**: Security policy application
4. **Tool Execution**: Tool availability and execution
5. **Context Collection**: Project scanning and analysis
6. **Complete Workflow**: End-to-end integration

## ⚙️ Configuration

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

### Environment Variables
- **HOME**: User home directory for log storage
- **OPENCODE_PROJECT_ROOT**: Project root directory

## 🐛 Debugging

### Debug Logging
```typescript
debugLogger.log("Message processing started", { 
  message: messageContent?.substring(0, 100) 
});

debugLogger.log("Task created successfully", { 
  taskId: task.id, 
  taskType: task.type 
});
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|--------|----------|
| Tasks not created | No work keywords detected | Check message content against keyword list |
| Tools not available | TaskManager not initialized | Ensure TaskManager instantiated in plugin |
| Policies not applied | Policy rules not matching | Verify policy rule matching logic |
| Context collection slow | Too many files scanned | Adjust scan depth and file filters |
| Logs not writing | Permission issues | Check log directory permissions |

## 📈 Performance Optimization

### Optimization Strategies
1. **Lazy Loading**: Load components only when needed
2. **Caching**: Cache policy contexts and project summaries
3. **Async Operations**: Use async/await throughout
4. **Resource Limits**: Enforce size and depth limits
5. **Batch Processing**: Group similar operations

### Monitoring
- **Memory Usage**: Monitor task storage size
- **Log Growth**: Track log file sizes and rotation
- **Processing Time**: Measure message processing latency
- **Error Rates**: Track failure patterns

## 🚨 Error Handling

### Error Patterns
```typescript
try {
  const task = await taskManager.createTask(workRequest);
  // Success path
} catch (error) {
  debugLogger.log("Failed to create task", { 
    error: error instanceof Error ? error.message : String(error) 
  });
  await auditLogger.log("TASK_CREATION_FAILED", {
    message: messageContent,
    error: error instanceof Error ? error.message : String(error)
  });
}
```

### Recovery Strategies
1. **Graceful Degradation**: Continue with reduced functionality
2. **Retry Logic**: Retry failed operations with exponential backoff
3. **User Feedback**: Clear error messages and alternative options
4. **Fallback Defaults**: Use sensible defaults when configuration fails

## 📚 API Reference

### TaskManager
```typescript
class TaskManager {
  async createTask(workRequest: WorkRequest): Promise<Task>
  async executeTask(taskId: string, toolName?: string, toolParameters?: any): Promise<Task>
  async getTask(taskId: string): Promise<Task | null>
  async getAllTasks(): Promise<Task[]>
  getAvailableTools(): TaskTool[]
  registerTool(tool: TaskTool): void
}
```

### PolicyInjector
```typescript
class PolicyInjector {
  async getContext(message: string): Promise<string>
  async applyRules(tool: string, params: any): Promise<any>
}
```

### ContextCollector
```typescript
class ContextCollector {
  async collectContext(): Promise<ProjectContext>
  async getProjectSummary(): Promise<string>
}
```

### ApprovalSystem
```typescript
class ApprovalSystem {
  async requestApproval(tool: string, params: any): Promise<boolean>
  async getPendingApprovals(): Promise<ApprovalRequest[]>
}
```

---

This quick reference provides essential information for developers working with the AI Work Automation Agent. For detailed information, refer to the complete documentation in the `/docs` directory.