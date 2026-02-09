"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const task_types_1 = require("../common/task.types");
const uuid_1 = require("uuid");
let OrchestratorService = class OrchestratorService {
    async planTask(task) {
        const plan = this.createTaskPlan(task);
        task.subTasks = plan;
        return task;
    }
    createTaskPlan(task) {
        switch (task.type) {
            case task_types_1.TaskType.MEETING:
                return this.createMeetingPlan(task);
            case task_types_1.TaskType.EMAIL:
                return this.createEmailPlan(task);
            case task_types_1.TaskType.SCHEDULE:
                return this.createSchedulePlan(task);
            case task_types_1.TaskType.DATA:
                return this.createDataPlan(task);
            default:
                return this.createDocumentPlan(task);
        }
    }
    createMeetingPlan(task) {
        return [
            {
                id: (0, uuid_1.v4)(),
                agentType: task_types_1.AgentType.DOC,
                status: task_types_1.TaskState.DRAFT,
                input: `Generate meeting minutes from: ${task.input}`,
                dependencies: [],
            },
            {
                id: (0, uuid_1.v4)(),
                agentType: task_types_1.AgentType.PMO,
                status: task_types_1.TaskState.DRAFT,
                input: `Extract action items and schedule from: ${task.input}`,
                dependencies: [],
            },
            {
                id: (0, uuid_1.v4)(),
                agentType: task_types_1.AgentType.COMMS,
                status: task_types_1.TaskState.DRAFT,
                input: `Draft follow-up email based on meeting: ${task.input}`,
                dependencies: [],
            },
            {
                id: (0, uuid_1.v4)(),
                agentType: task_types_1.AgentType.COMPLIANCE,
                status: task_types_1.TaskState.DRAFT,
                input: `Review for external communication and PII: ${task.input}`,
                dependencies: [],
            },
        ];
    }
    createEmailPlan(task) {
        return [
            {
                id: (0, uuid_1.v4)(),
                agentType: task_types_1.AgentType.COMMS,
                status: task_types_1.TaskState.DRAFT,
                input: `Draft email: ${task.input}`,
                dependencies: [],
            },
            {
                id: (0, uuid_1.v4)(),
                agentType: task_types_1.AgentType.COMPLIANCE,
                status: task_types_1.TaskState.DRAFT,
                input: `Review for external/PII: ${task.input}`,
                dependencies: [],
            },
        ];
    }
    createSchedulePlan(task) {
        return [
            {
                id: (0, uuid_1.v4)(),
                agentType: task_types_1.AgentType.PMO,
                status: task_types_1.TaskState.DRAFT,
                input: `Create schedule: ${task.input}`,
                dependencies: [],
            },
            {
                id: (0, uuid_1.v4)(),
                agentType: task_types_1.AgentType.COMPLIANCE,
                status: task_types_1.TaskState.DRAFT,
                input: `Review schedule for conflicts: ${task.input}`,
                dependencies: [],
            },
        ];
    }
    createDataPlan(task) {
        return [
            {
                id: (0, uuid_1.v4)(),
                agentType: task_types_1.AgentType.DATA,
                status: task_types_1.TaskState.DRAFT,
                input: `Analyze data: ${task.input}`,
                dependencies: [],
            },
            {
                id: (0, uuid_1.v4)(),
                agentType: task_types_1.AgentType.DOC,
                status: task_types_1.TaskState.DRAFT,
                input: `Create report from analysis`,
                dependencies: [],
            },
        ];
    }
    createDocumentPlan(task) {
        return [
            {
                id: (0, uuid_1.v4)(),
                agentType: task_types_1.AgentType.DOC,
                status: task_types_1.TaskState.DRAFT,
                input: `Create document: ${task.input}`,
                dependencies: [],
            },
        ];
    }
    async delegateSubTask(task, subTaskId) {
        const subTask = task.subTasks.find(st => st.id === subTaskId);
        if (!subTask)
            return;
        subTask.status = task_types_1.TaskState.REVIEW;
    }
    isTaskComplete(task) {
        return task.subTasks.every(st => st.status === task_types_1.TaskState.COMPLETED || st.status === task_types_1.TaskState.APPROVED);
    }
};
exports.OrchestratorService = OrchestratorService;
exports.OrchestratorService = OrchestratorService = __decorate([
    (0, common_1.Injectable)()
], OrchestratorService);
//# sourceMappingURL=orchestrator.service.js.map