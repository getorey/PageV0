export interface Task {
    id: string;
    type: string;
    title: string;
    description: string;
    input: string;
    output?: string;
    state: TaskState;
    riskLevel: RiskLevel;
    metadata: TaskMetadata;
    createdAt: Date;
    updatedAt: Date;
}
export type TaskState = "draft" | "review" | "approval_required" | "approved" | "completed" | "archived";
export type RiskLevel = "r0_low" | "r1_medium" | "r2_high" | "r3_critical";
export interface TaskMetadata {
    requester: string;
    approver?: string;
    riskTags: RiskTag[];
}
export interface RiskTag {
    type: string;
    level: RiskLevel;
    description: string;
}
export declare class TaskManager {
    private tasks;
    createTask(input: {
        title: string;
        description: string;
        request: string;
        requester: string;
    }): Promise<Task>;
    getTask(id: string): Promise<Task | undefined>;
    updateTaskState(id: string, state: TaskState): Promise<Task | undefined>;
    getAllTasks(): Promise<Task[]>;
    private classifyTaskType;
}
//# sourceMappingURL=task-manager.d.ts.map