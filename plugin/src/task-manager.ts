import { v4 as uuidv4 } from "uuid";

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

export type TaskState = 
  | "draft" 
  | "review" 
  | "approval_required" 
  | "approved" 
  | "completed" 
  | "archived";

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

export class TaskManager {
  private tasks: Map<string, Task> = new Map();

  async createTask(input: {
    title: string;
    description: string;
    request: string;
    requester: string;
  }): Promise<Task> {
    const task: Task = {
      id: uuidv4(),
      type: this.classifyTaskType(input.request),
      title: input.title,
      description: input.description,
      input: input.request,
      state: "draft",
      riskLevel: "r0_low",
      metadata: {
        requester: input.requester,
        riskTags: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasks.set(task.id, task);
    return task;
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async updateTaskState(id: string, state: TaskState): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (task) {
      task.state = state;
      task.updatedAt = new Date();
    }
    return task;
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  private classifyTaskType(request: string): string {
    const lower = request.toLowerCase();
    if (lower.includes("meeting") || lower.includes("회의")) return "meeting";
    if (lower.includes("email") || lower.includes("메일")) return "email";
    if (lower.includes("schedule") || lower.includes("일정")) return "schedule";
    if (lower.includes("report") || lower.includes("보고서")) return "data";
    return "document";
  }
}
