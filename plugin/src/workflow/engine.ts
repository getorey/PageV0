import type { Task, TaskState } from "../task-manager";

export class WorkflowEngine {
  private stateTransitions: Map<TaskState, TaskState[]> = new Map([
    ["draft", ["review"]],
    ["review", ["approval_required", "completed"]],
    ["approval_required", ["approved", "review"]],
    ["approved", ["completed"]],
    ["completed", ["archived"]],
  ]);

  canTransition(from: TaskState, to: TaskState): boolean {
    const allowed = this.stateTransitions.get(from);
    return allowed?.includes(to) ?? false;
  }

  getNextStates(current: TaskState): TaskState[] {
    return this.stateTransitions.get(current) || [];
  }

  determineNextState(task: Task): TaskState {
    switch (task.state) {
      case "draft":
        return "review";
      case "review":
        return this.requiresApproval(task) ? "approval_required" : "completed";
      case "approval_required":
        return "approved";
      case "approved":
        return "completed";
      default:
        return task.state;
    }
  }

  requiresApproval(task: Task): boolean {
    if (task.riskLevel === "r3_critical") return true;
    if (task.riskLevel === "r2_high") return true;
    return task.metadata.riskTags.some(t => 
      t.type === "external" || t.type === "personal_info"
    );
  }
}
