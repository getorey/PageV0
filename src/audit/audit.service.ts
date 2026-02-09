import { Injectable } from '@nestjs/common';
import {
  Task,
  TaskState,
  AgentType,
  ApprovalRequest,
} from '../common/task.types';

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  taskId: string;
  event: string;
  user: string;
  details: Record<string, any>;
}

@Injectable()
export class AuditService {
  private logs: AuditLogEntry[] = [];

  async logTaskCreated(task: Task): Promise<void> {
    this.log({
      taskId: task.id,
      event: 'TASK_CREATED',
      user: task.metadata.requester,
      details: {
        type: task.type,
        riskLevel: task.riskLevel,
        riskTags: task.metadata.riskTags,
      },
    });
  }

  async logStateTransition(
    task: Task,
    fromState: TaskState,
    toState: TaskState,
  ): Promise<void> {
    this.log({
      taskId: task.id,
      event: 'STATE_TRANSITION',
      user: 'system',
      details: { from: fromState, to: toState },
    });
  }

  async logSubTaskExecuted(
    task: Task,
    agentType: AgentType,
    input: string,
    output: string,
  ): Promise<void> {
    this.log({
      taskId: task.id,
      event: 'SUBTASK_EXECUTED',
      user: 'system',
      details: {
        agentType,
        input: this.maskSensitiveData(input),
        output: this.maskSensitiveData(output),
      },
    });
  }

  async logApprovalRequested(request: ApprovalRequest): Promise<void> {
    this.log({
      taskId: request.taskId,
      event: 'APPROVAL_REQUESTED',
      user: 'system',
      details: {
        requestId: request.id,
        action: request.action,
        target: request.target,
        riskSummary: request.riskSummary,
      },
    });
  }

  async logApprovalResolved(
    request: ApprovalRequest,
    approver: string,
  ): Promise<void> {
    this.log({
      taskId: request.taskId,
      event: request.status === 'approved' ? 'APPROVAL_APPROVED' : 'APPROVAL_REJECTED',
      user: approver,
      details: {
        requestId: request.id,
        reason: request.rejectionReason,
      },
    });
  }

  async getLogsForTask(taskId: string): Promise<AuditLogEntry[]> {
    return this.logs.filter(log => log.taskId === taskId);
  }

  async getAllLogs(
    page: number = 1,
    limit: number = 50,
  ): Promise<AuditLogEntry[]> {
    const start = (page - 1) * limit;
    return this.logs.slice(start, start + limit);
  }

  private log(partial: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      ...partial,
    };
    this.logs.push(entry);
  }

  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private maskSensitiveData(data: string): string {
    return data
      .replace(/\d{6}-\d{7}/g, '******-*******')
      .replace(/\d{3}-\d{4}-\d{4}/g, '***-****-****')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '***@***.***');
  }
}
