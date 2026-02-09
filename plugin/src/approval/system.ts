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

export class ApprovalSystem {
  private client: Client;
  private pendingApprovals: Map<string, ApprovalRequest> = new Map();

  constructor(client: Client) {
    this.client = client;
  }

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

  async getPendingApprovals(): Promise<ApprovalRequest[]> {
    return Array.from(this.pendingApprovals.values()).filter(r => !r.approved);
  }

  private sanitizeParams(params: any): any {
    const sensitive = ["password", "token", "key", "secret"];
    const sanitized = { ...params };
    
    for (const key of Object.keys(sanitized)) {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        sanitized[key] = "***REDACTED***";
      }
    }
    
    return sanitized;
  }
}
