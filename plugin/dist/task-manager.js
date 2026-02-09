import { v4 as uuidv4 } from "uuid";
export class TaskManager {
    tasks = new Map();
    async createTask(input) {
        const task = {
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
    async getTask(id) {
        return this.tasks.get(id);
    }
    async updateTaskState(id, state) {
        const task = this.tasks.get(id);
        if (task) {
            task.state = state;
            task.updatedAt = new Date();
        }
        return task;
    }
    async getAllTasks() {
        return Array.from(this.tasks.values());
    }
    classifyTaskType(request) {
        const lower = request.toLowerCase();
        if (lower.includes("meeting") || lower.includes("회의"))
            return "meeting";
        if (lower.includes("email") || lower.includes("메일"))
            return "email";
        if (lower.includes("schedule") || lower.includes("일정"))
            return "schedule";
        if (lower.includes("report") || lower.includes("보고서"))
            return "data";
        return "document";
    }
}
//# sourceMappingURL=task-manager.js.map