import { Task, TaskState, ApprovalRequest } from '../common/task.types';
export declare class WorkflowService {
    private readonly stateTransitions;
    canTransition(from: TaskState, to: TaskState): boolean;
    getNextStates(currentState: TaskState): TaskState[];
    determineNextState(task: Task, approvalRequest?: ApprovalRequest): TaskState;
    requiresApproval(task: Task): boolean;
}
