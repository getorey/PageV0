"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowService = void 0;
const common_1 = require("@nestjs/common");
const task_types_1 = require("../common/task.types");
let WorkflowService = class WorkflowService {
    constructor() {
        this.stateTransitions = new Map([
            [task_types_1.TaskState.DRAFT, [task_types_1.TaskState.REVIEW]],
            [task_types_1.TaskState.REVIEW, [task_types_1.TaskState.APPROVAL_REQUIRED, task_types_1.TaskState.COMPLETED]],
            [task_types_1.TaskState.APPROVAL_REQUIRED, [task_types_1.TaskState.APPROVED, task_types_1.TaskState.REVIEW]],
            [task_types_1.TaskState.APPROVED, [task_types_1.TaskState.COMPLETED]],
            [task_types_1.TaskState.COMPLETED, [task_types_1.TaskState.ARCHIVED]],
        ]);
    }
    canTransition(from, to) {
        const allowedTransitions = this.stateTransitions.get(from);
        return allowedTransitions?.includes(to) ?? false;
    }
    getNextStates(currentState) {
        return this.stateTransitions.get(currentState) || [];
    }
    determineNextState(task, approvalRequest) {
        switch (task.state) {
            case task_types_1.TaskState.DRAFT:
                return task_types_1.TaskState.REVIEW;
            case task_types_1.TaskState.REVIEW:
                if (this.requiresApproval(task)) {
                    return task_types_1.TaskState.APPROVAL_REQUIRED;
                }
                return task_types_1.TaskState.COMPLETED;
            case task_types_1.TaskState.APPROVAL_REQUIRED:
                if (approvalRequest?.status === 'approved') {
                    return task_types_1.TaskState.APPROVED;
                }
                else if (approvalRequest?.status === 'rejected') {
                    return task_types_1.TaskState.REVIEW;
                }
                return task_types_1.TaskState.APPROVAL_REQUIRED;
            case task_types_1.TaskState.APPROVED:
                return task_types_1.TaskState.COMPLETED;
            default:
                return task.state;
        }
    }
    requiresApproval(task) {
        if (task.riskLevel === task_types_1.RiskLevel.R3_CRITICAL)
            return true;
        if (task.riskLevel === task_types_1.RiskLevel.R2_HIGH)
            return true;
        if (task.type === 'email' && task.metadata.riskTags.some(t => t.type === 'external')) {
            return true;
        }
        if (task.metadata.riskTags.some(t => t.type === 'personal_info')) {
            return true;
        }
        return false;
    }
};
exports.WorkflowService = WorkflowService;
exports.WorkflowService = WorkflowService = __decorate([
    (0, common_1.Injectable)()
], WorkflowService);
//# sourceMappingURL=workflow.service.js.map