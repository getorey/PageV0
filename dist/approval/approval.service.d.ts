import { Task, ApprovalRequest } from '../common/task.types';
export declare class ApprovalService {
    private approvalRequests;
    createApprovalRequest(task: Task, action: string, target: string, scope: string, alternatives?: string[]): Promise<ApprovalRequest>;
    approve(requestId: string, approver: string): Promise<ApprovalRequest>;
    reject(requestId: string, approver: string, reason: string): Promise<ApprovalRequest>;
    getRequest(requestId: string): Promise<ApprovalRequest | undefined>;
    getPendingRequests(): Promise<ApprovalRequest[]>;
    private generateRiskSummary;
}
