import type { Task, TaskState } from "../task-manager";
export declare class WorkflowEngine {
    private stateTransitions;
    canTransition(from: TaskState, to: TaskState): boolean;
    getNextStates(current: TaskState): TaskState[];
    determineNextState(task: Task): TaskState;
    requiresApproval(task: Task): boolean;
}
//# sourceMappingURL=engine.d.ts.map