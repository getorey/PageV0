export declare enum TaskType {
    MEETING = "meeting",
    DOCUMENT = "document",
    EMAIL = "email",
    SCHEDULE = "schedule",
    DATA = "data",
    APPROVAL = "approval"
}
export declare enum TaskState {
    DRAFT = "draft",
    REVIEW = "review",
    APPROVAL_REQUIRED = "approval_required",
    APPROVED = "approved",
    COMPLETED = "completed",
    ARCHIVED = "archived"
}
export declare enum RiskLevel {
    R0_LOW = "r0_low",
    R1_MEDIUM = "r1_medium",
    R2_HIGH = "r2_high",
    R3_CRITICAL = "r3_critical"
}
export declare enum AgentType {
    ORCHESTRATOR = "orchestrator",
    DOC = "doc",
    COMMS = "comms",
    PMO = "pmo",
    DATA = "data",
    RESEARCH = "research",
    COMPLIANCE = "compliance",
    OPS = "ops"
}
export interface Task {
    id: string;
    type: TaskType;
    state: TaskState;
    riskLevel: RiskLevel;
    title: string;
    description: string;
    input: string;
    output?: string;
    metadata: TaskMetadata;
    subTasks: SubTask[];
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
}
export interface TaskMetadata {
    requester: string;
    approver?: string;
    rulesVersion: string;
    templateId?: string;
    riskTags: RiskTag[];
    auditLogId: string;
}
export interface RiskTag {
    type: 'external' | 'personal_info' | 'security' | 'contract' | 'budget';
    level: RiskLevel;
    description: string;
}
export interface SubTask {
    id: string;
    agentType: AgentType;
    status: TaskState;
    input: string;
    output?: string;
    dependencies: string[];
}
export interface ApprovalRequest {
    id: string;
    taskId: string;
    action: string;
    target: string;
    scope: string;
    justification: string;
    riskSummary: string;
    alternatives: string[];
    requestedAt: Date;
    approvedAt?: Date;
    approvedBy?: string;
    status: 'pending' | 'approved' | 'rejected' | 'timeout';
    rejectionReason?: string;
}
