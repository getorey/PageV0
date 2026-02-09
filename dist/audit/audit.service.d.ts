import { Task, TaskState, AgentType, ApprovalRequest } from '../common/task.types';
interface AuditLogEntry {
    id: string;
    timestamp: Date;
    taskId: string;
    event: string;
    user: string;
    details: Record<string, any>;
}
export declare class AuditService {
    private logs;
    logTaskCreated(task: Task): Promise<void>;
    logStateTransition(task: Task, fromState: TaskState, toState: TaskState): Promise<void>;
    logSubTaskExecuted(task: Task, agentType: AgentType, input: string, output: string): Promise<void>;
    logApprovalRequested(request: ApprovalRequest): Promise<void>;
    logApprovalResolved(request: ApprovalRequest, approver: string): Promise<void>;
    getLogsForTask(taskId: string): Promise<AuditLogEntry[]>;
    getAllLogs(page?: number, limit?: number): Promise<AuditLogEntry[]>;
    private log;
    private generateId;
    private maskSensitiveData;
}
export {};
