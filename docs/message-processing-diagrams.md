# AI Work Automation Agent - Message Processing Sequence Diagram

## Sequence Flow

```mermaid
sequenceDiagram
    participant User
    participant OpenCode
    participant MessageHook
    participant MessageProcessor
    participant TaskManager
    participant PolicyInjector
    participant ContextCollector
    participant ApprovalSystem
    participant Tools
    participant AuditLogger

    User->>OpenCode: Types/Sends message
    OpenCode->>MessageHook: message.part.updated
    Note over MessageHook: Real-time text capture
    
    MessageHook->>MessageProcessor: handleMessage()
    Note over MessageProcessor: Extract message content
    
    MessageProcessor->>MessageProcessor: analyzeWorkRequest()
    Note over MessageProcessor: Check for work keywords
    
    alt Work Request Detected
        MessageProcessor->>TaskManager: createTask()
        Note over TaskManager: Create task with metadata
        
        TaskManager->>TaskManager: inferTaskType()
        Note over TaskManager: Determine task type
        
        TaskManager->>AuditLogger: log('task_created')
        Note over AuditLogger: Record task creation
        
        MessageProcessor->>PolicyInjector: getContext()
        Note over PolicyInjector: Apply security policies
        
        MessageProcessor->>ContextCollector: getProjectSummary()
        Note over ContextCollector: Scan project files
        
        MessageProcessor->>MessageProcessor: Inject system prompt
        Note over MessageProcessor: Add task context to AI
        
        MessageProcessor->>AuditLogger: log('WORK_REQUEST_DETECTED')
        
        MessageProcessor->>OpenCode: Return enhanced prompt
        OpenCode->>User: AI responds with task-aware response
        
        User->>OpenCode: Requests tool execution
        OpenCode->>Tools: executeTask()
        
        Tools->>ApprovalSystem: requestApproval()
        Note over ApprovalSystem: Check if approval needed
        
        alt Approval Required
            ApprovalSystem->>User: Request approval
            User->>ApprovalSystem: Grant/Deny approval
        end
        
        Tools->>Tools: Execute specific tool
        Note over Tools: e.g., create_meeting_minutes
        
        Tools->>AuditLogger: log('task_completed')
        Tools->>OpenCode: Return tool result
        OpenCode->>User: Present results
        
    else Non-Work Request
        MessageProcessor->>OpenCode: Standard processing
        OpenCode->>User: Standard AI response
    end
```

## Component Interaction Diagram

```mermaid
graph TB
    User[User Input] --> Hook1[message.part.updated]
    User --> Hook2[message.created]
    User --> Hook3[chat.message]
    User --> Hook4[user.message]
    
    Hook1 --> Processor[handleMessage]
    Hook2 --> Processor
    Hook3 --> Processor
    Hook4 --> Processor
    
    Processor --> Analyzer[analyzeWorkRequest]
    Processor --> TaskMgr[TaskManager]
    Processor --> Policy[PolicyInjector]
    Processor --> Context[ContextCollector]
    Processor --> Audit[AuditLogger]
    
    TaskMgr --> Tools[Tool System]
    TaskMgr --> Storage[Task Storage]
    TaskMgr --> Audit
    
    Tools --> Approval[ApprovalSystem]
    Tools --> Meeting[create_meeting_minutes]
    Tools --> Email[draft_email]
    Tools --> Summary[summarize_discussion]
    
    Approval --> User
    Policy --> Transform[messages.transform]
    Context --> Policy
    
    Transform --> AI[AI System]
    Processor --> AI
    
    AI --> User
```

## Data Flow Map

```mermaid
flowchart LR
    Input[User Message] --> Extract[Content Extraction]
    Extract --> Analyze[Work Request Analysis]
    
    Analyze -->|Work Detected| Task[Task Creation]
    Analyze -->|Regular Chat| Standard[Standard Processing]
    
    Task --> Infer[Task Type Inference]
    Infer --> Create[Create Task Object]
    Create --> Store[Persist Task]
    
    Task --> Policy[Policy Context]
    Task --> Context[Project Context]
    
    Policy --> Inject[System Prompt Injection]
    Context --> Inject
    
    Inject --> AI[AI Processing]
    Standard --> AI
    
    AI --> Execute[Tool Execution]
    Execute --> Approve[Approval Check]
    
    Approve -->|High Risk| UserApproval[User Approval]
    Approve -->|Low Risk| ToolRun[Run Tool]
    
    UserApproval --> ToolRun
    ToolRun --> Result[Tool Result]
    Result --> Complete[Task Completion]
    
    Complete --> Log[Audit Logging]
    Store --> Log
```

## State Transitions

```mermaid
stateDiagram-v2
    [*] --> Input: User Message
    Input --> Analysis: Extract Content
    Analysis --> WorkCheck: Analyze Keywords
    
    WorkCheck --> WorkFlow: Work Request
    WorkCheck --> StandardFlow: Regular Chat
    
    WorkFlow --> TaskCreate: Create Task
    TaskCreate --> PolicyInject: Get Policies
    PolicyInject --> ContextGet: Get Context
    ContextGet --> PromptEnhance: Enhance Prompt
    PromptEnhance --> AIProcess: AI Processing
    
    AIProcess --> ToolRequest: Tool Request
    ToolRequest --> ApprovalCheck: Need Approval?
    
    ApprovalCheck --> Yes: High Risk
    ApprovalCheck --> No: Low Risk
    
    Yes --> UserApprove: Request User
    UserApprove --> ToolExecute: Execute Tool
    No --> ToolExecute: Execute Tool
    
    ToolExecute --> TaskComplete: Task Complete
    TaskComplete --> LogResult: Audit Log
    
    StandardFlow --> AIStandard: Standard AI
    AIStandard --> UserResponse: Response
    LogResult --> UserResponse
    UserResponse --> [*]
```

## Error Handling Flow

```mermaid
flowchart TD
    Process[Message Processing] --> Try{Try Execute}
    Try -->|Success| Success[Task Completed]
    Try -->|Error| Catch[Error Caught]
    
    Catch --> LogError[Log Error]
    LogError --> Retry{Can Retry?}
    
    Retry -->|Yes| Wait[Wait and Retry]
    Retry -->|No| Fail[Task Failed]
    
    Wait --> Try
    Success --> AuditLog[Audit Log]
    Fail --> AuditLog
    AuditLog --> UserNotify[Notify User]
    
    UserNotify --> Continue[Continue Processing]
    Continue --> [*]
```

## Security Flow

```mermaid
sequenceDiagram
    participant User
    participant System
    participant PolicyEngine
    participant RiskAnalyzer
    participant ApprovalSystem
    participant AuditLogger

    User->>System: Request Action
    System->>PolicyEngine: Check Policies
    PolicyEngine->>RiskAnalyzer: Assess Risk
    RiskAnalyzer->>RiskAnalyzer: Analyze Tool & Params
    RiskAnalyzer->>PolicyEngine: Risk Level
    
    PolicyEngine->>ApprovalSystem: High Risk?
    alt High Risk
        ApprovalSystem->>User: Approval Request
        User->>ApprovalSystem: Approval Decision
        ApprovalSystem->>System: Execute/Deny
    else Low Risk
        ApprovalSystem->>System: Auto Approve
    end
    
    System->>AuditLogger: Log Action
    System->>User: Result
```

## Context Collection Flow

```mermaid
flowchart TB
    Start[Session Start] --> Scan[Scan Project Directory]
    Scan --> Filter[Filter Files]
    Filter --> Read[Read Important Files]
    Read --> Analyze[Analyze Project Type]
    Analyze --> Generate[Generate Summary]
    Generate --> Cache[Cache Context]
    Cache --> Available[Context Available]
    
    Available --> Message[User Message]
    Message --> Inject[Inject Context to AI]
    Inject --> Response[Context-Aware Response]
```

## Tool Execution Flow

```mermaid
stateDiagram-v2
    [*] --> TaskPending: Task Created
    TaskPending --> TaskRunning: Execute Requested
    TaskRunning --> ToolCheck: Check Tool Availability
    
    ToolCheck --> ToolExecute: Tool Available
    ToolCheck --> DefaultExecute: No Specific Tool
    
    ToolExecute --> ToolLogic: Run Tool Logic
    DefaultExecute --> DefaultLogic: Default Analysis
    
    ToolLogic --> TaskComplete: Success
    DefaultLogic --> TaskComplete: Success
    
    ToolLogic --> TaskFailed: Error
    DefaultLogic --> TaskFailed: Error
    
    TaskComplete --> [*]: Archive Task
    TaskFailed --> [*]: Log Failure
```

## Memory and Resource Management

```mermaid
flowchart LR
    Start[Memory Check] --> UnderLimit{Memory < Limit?}
    
    UnderLimit -->|Yes| Process[Process Message]
    UnderLimit -->|No| Cleanup[Cleanup Resources]
    
    Cleanup --> RemoveOld[Remove Old Tasks]
    RemoveOld --> RotateLogs[Rotate Logs]
    RotateLogs --> ClearCache[Clear Cache]
    ClearCache --> Process
    
    Process --> Success[Success]
    Process --> Error[Error]
    
    Success --> Monitor[Monitor Resources]
    Error --> Monitor
    Monitor --> Start
```

## Integration Points

```mermaid
graph TB
    subgraph "OpenCode Ecosystem"
        OC[OpenCode Core]
        Hooks[Hook System]
        Session[Session Manager]
        Client[Client Interface]
    end
    
    subgraph "AI Work Agent"
        Index[Main Plugin]
        Tasks[Task Manager]
        Policy[Policy Engine]
        Context[Context Collector]
        Tools[Tool System]
    end
    
    subgraph "External Systems"
        FileSystem[File System]
        LogFiles[Log Files]
        Config[Configuration]
    end
    
    OC --> Hooks
    Hooks --> Index
    Session --> Index
    Client --> Approval[Approval System]
    
    Index --> Tasks
    Index --> Policy
    Index --> Context
    Index --> Tools
    
    Tasks --> FileSystem
    Policy --> Config
    Context --> FileSystem
    Approval --> Client
    
    Audit[Audit Logger] --> LogFiles
    Tasks --> Audit
    Tools --> Audit
    Policy --> Audit
```

These diagrams provide a comprehensive visual representation of the message processing flow, component interactions, state transitions, and system architecture for the AI Work Automation Agent.