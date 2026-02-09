import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Task, ApprovalRequest } from '../common/task.types';

@Injectable()
export class ApprovalService {
  private approvalRequests: Map<string, ApprovalRequest> = new Map();

  async createApprovalRequest(
    task: Task,
    action: string,
    target: string,
    scope: string,
    alternatives: string[] = [],
  ): Promise<ApprovalRequest> {
    const request: ApprovalRequest = {
      id: uuidv4(),
      taskId: task.id,
      action,
      target,
      scope,
      justification: task.input,
      riskSummary: this.generateRiskSummary(task),
      alternatives,
      requestedAt: new Date(),
      status: 'pending',
    };

    this.approvalRequests.set(request.id, request);
    return request;
  }

  async approve(requestId: string, approver: string): Promise<ApprovalRequest> {
    const request = this.approvalRequests.get(requestId);
    if (!request) {
      throw new Error(`Approval request ${requestId} not found`);
    }

    request.status = 'approved';
    request.approvedBy = approver;
    request.approvedAt = new Date();

    return request;
  }

  async reject(
    requestId: string,
    approver: string,
    reason: string,
  ): Promise<ApprovalRequest> {
    const request = this.approvalRequests.get(requestId);
    if (!request) {
      throw new Error(`Approval request ${requestId} not found`);
    }

    request.status = 'rejected';
    request.approvedBy = approver;
    request.rejectionReason = reason;

    return request;
  }

  async getRequest(requestId: string): Promise<ApprovalRequest | undefined> {
    return this.approvalRequests.get(requestId);
  }

  async getPendingRequests(): Promise<ApprovalRequest[]> {
    return Array.from(this.approvalRequests.values()).filter(
      r => r.status === 'pending',
    );
  }

  private generateRiskSummary(task: Task): string {
    const risks: string[] = [];

    if (task.metadata.riskTags.some(t => t.type === 'external')) {
      risks.push('대외 발신 위험');
    }
    if (task.metadata.riskTags.some(t => t.type === 'personal_info')) {
      risks.push('개인정보 포함');
    }
    if (task.metadata.riskTags.some(t => t.type === 'security')) {
      risks.push('보안 등급 상승');
    }

    return risks.length > 0 ? risks.join(', ') : '특별한 위험 없음';
  }
}
