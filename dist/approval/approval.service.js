"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let ApprovalService = class ApprovalService {
    constructor() {
        this.approvalRequests = new Map();
    }
    async createApprovalRequest(task, action, target, scope, alternatives = []) {
        const request = {
            id: (0, uuid_1.v4)(),
            taskId: task.id,
            action,
            target,
            scope,
            justification: task.input,
            riskSummary: this.generateRiskSummary(task),
            alternatives,
            requestedAt: new Date(),
            status: 'pending',
        };
        this.approvalRequests.set(request.id, request);
        return request;
    }
    async approve(requestId, approver) {
        const request = this.approvalRequests.get(requestId);
        if (!request) {
            throw new Error(`Approval request ${requestId} not found`);
        }
        request.status = 'approved';
        request.approvedBy = approver;
        request.approvedAt = new Date();
        return request;
    }
    async reject(requestId, approver, reason) {
        const request = this.approvalRequests.get(requestId);
        if (!request) {
            throw new Error(`Approval request ${requestId} not found`);
        }
        request.status = 'rejected';
        request.approvedBy = approver;
        request.rejectionReason = reason;
        return request;
    }
    async getRequest(requestId) {
        return this.approvalRequests.get(requestId);
    }
    async getPendingRequests() {
        return Array.from(this.approvalRequests.values()).filter(r => r.status === 'pending');
    }
    generateRiskSummary(task) {
        const risks = [];
        if (task.metadata.riskTags.some(t => t.type === 'external')) {
            risks.push('대외 발신 위험');
        }
        if (task.metadata.riskTags.some(t => t.type === 'personal_info')) {
            risks.push('개인정보 포함');
        }
        if (task.metadata.riskTags.some(t => t.type === 'security')) {
            risks.push('보안 등급 상승');
        }
        return risks.length > 0 ? risks.join(', ') : '특별한 위험 없음';
    }
};
exports.ApprovalService = ApprovalService;
exports.ApprovalService = ApprovalService = __decorate([
    (0, common_1.Injectable)()
], ApprovalService);
//# sourceMappingURL=approval.service.js.map