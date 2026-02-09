"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
let AuditService = class AuditService {
    constructor() {
        this.logs = [];
    }
    async logTaskCreated(task) {
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
    async logStateTransition(task, fromState, toState) {
        this.log({
            taskId: task.id,
            event: 'STATE_TRANSITION',
            user: 'system',
            details: { from: fromState, to: toState },
        });
    }
    async logSubTaskExecuted(task, agentType, input, output) {
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
    async logApprovalRequested(request) {
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
    async logApprovalResolved(request, approver) {
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
    async getLogsForTask(taskId) {
        return this.logs.filter(log => log.taskId === taskId);
    }
    async getAllLogs(page = 1, limit = 50) {
        const start = (page - 1) * limit;
        return this.logs.slice(start, start + limit);
    }
    log(partial) {
        const entry = {
            id: this.generateId(),
            timestamp: new Date(),
            ...partial,
        };
        this.logs.push(entry);
    }
    generateId() {
        return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    maskSensitiveData(data) {
        return data
            .replace(/\d{6}-\d{7}/g, '******-*******')
            .replace(/\d{3}-\d{4}-\d{4}/g, '***-****-****')
            .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '***@***.***');
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)()
], AuditService);
//# sourceMappingURL=audit.service.js.map