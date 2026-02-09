import { Injectable } from '@nestjs/common';
import { Task, TaskState, RiskLevel, ApprovalRequest } from '../common/task.types';

@Injectable()
export class WorkflowService {
  private readonly stateTransitions: Map<TaskState, TaskState[]> = new Map([
    [TaskState.DRAFT, [TaskState.REVIEW]],
    [TaskState.REVIEW, [TaskState.APPROVAL_REQUIRED, TaskState.COMPLETED]],
    [TaskState.APPROVAL_REQUIRED, [TaskState.APPROVED, TaskState.REVIEW]],
    [TaskState.APPROVED, [TaskState.COMPLETED]],
    [TaskState.COMPLETED, [TaskState.ARCHIVED]],
  ]);

  canTransition(from: TaskState, to: TaskState): boolean {
    const allowedTransitions = this.stateTransitions.get(from);
    return allowedTransitions?.includes(to) ?? false;
  }

  getNextStates(currentState: TaskState): TaskState[] {
    return this.stateTransitions.get(currentState) || [];
  }

  determineNextState(task: Task, approvalRequest?: ApprovalRequest): TaskState {
    switch (task.state) {
      case TaskState.DRAFT:
        return TaskState.REVIEW;

      case TaskState.REVIEW:
        if (this.requiresApproval(task)) {
          return TaskState.APPROVAL_REQUIRED;
        }
        return TaskState.COMPLETED;

      case TaskState.APPROVAL_REQUIRED:
        if (approvalRequest?.status === 'approved') {
          return TaskState.APPROVED;
        } else if (approvalRequest?.status === 'rejected') {
          return TaskState.REVIEW;
        }
        return TaskState.APPROVAL_REQUIRED;

      case TaskState.APPROVED:
        return TaskState.COMPLETED;

      default:
        return task.state;
    }
  }

  requiresApproval(task: Task): boolean {
    if (task.riskLevel === RiskLevel.R3_CRITICAL) return true;
    if (task.riskLevel === RiskLevel.R2_HIGH) return true;
    if (task.type === 'email' && task.metadata.riskTags.some(t => t.type === 'external')) {
      return true;
    }
    if (task.metadata.riskTags.some(t => t.type === 'personal_info')) {
      return true;
    }
    return false;
  }
}
