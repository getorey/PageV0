import type { Client } from "../types/opencode";
export interface ApprovalRequest {
    id: string;
    tool: string;
    params: any;
    requestedAt: Date;
    approved?: boolean;
    approvedBy?: string;
    approvedAt?: Date;
}
export declare class ApprovalSystem {
    private client;
    private pendingApprovals;
    constructor(client: Client);
    requestApproval(tool: string, params: any): Promise<boolean>;
    getPendingApprovals(): Promise<ApprovalRequest[]>;
    private sanitizeParams;
}
//# sourceMappingURL=system.d.ts.map