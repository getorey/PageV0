"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntakeService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const task_types_1 = require("../common/task.types");
let IntakeService = class IntakeService {
    async processRequest(request) {
        const taskType = this.classifyTaskType(request.input, request.type);
        const riskTags = this.analyzeRiskTags(request.input, taskType);
        const riskLevel = this.calculateRiskLevel(riskTags);
        const task = {
            id: (0, uuid_1.v4)(),
            type: taskType,
            state: task_types_1.TaskState.DRAFT,
            riskLevel,
            title: request.title,
            description: request.description,
            input: request.input,
            metadata: {
                requester: request.requester,
                rulesVersion: '1.0.0',
                riskTags,
                auditLogId: (0, uuid_1.v4)(),
            },
            subTasks: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return task;
    }
    classifyTaskType(input, explicitType) {
        if (explicitType)
            return explicitType;
        const lowerInput = input.toLowerCase();
        if (lowerInput.includes('회의') || lowerInput.includes('meeting')) {
            return task_types_1.TaskType.MEETING;
        }
        if (lowerInput.includes('메일') || lowerInput.includes('email') || lowerInput.includes('공지')) {
            return task_types_1.TaskType.EMAIL;
        }
        if (lowerInput.includes('일정') || lowerInput.includes('schedule')) {
            return task_types_1.TaskType.SCHEDULE;
        }
        if (lowerInput.includes('데이터') || lowerInput.includes('data') || lowerInput.includes('보고서')) {
            return task_types_1.TaskType.DATA;
        }
        return task_types_1.TaskType.DOCUMENT;
    }
    analyzeRiskTags(input, taskType) {
        const tags = [];
        const lowerInput = input.toLowerCase();
        if (lowerInput.includes('외부') || lowerInput.includes('대외') || lowerInput.includes('발신')) {
            tags.push({
                type: 'external',
                level: task_types_1.RiskLevel.R2_HIGH,
                description: 'External communication detected',
            });
        }
        const piiPatterns = [
            /\d{6}-\d{7}/,
            /\d{3}-\d{4}-\d{4}/,
            /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
        ];
        const hasPII = piiPatterns.some(pattern => pattern.test(input));
        if (hasPII || lowerInput.includes('개인정보') || lowerInput.includes('주민번호')) {
            tags.push({
                type: 'personal_info',
                level: task_types_1.RiskLevel.R2_HIGH,
                description: 'Personal information detected',
            });
        }
        if (lowerInput.includes('보안') || lowerInput.includes('비밀') || lowerInput.includes('기밀')) {
            tags.push({
                type: 'security',
                level: task_types_1.RiskLevel.R3_CRITICAL,
                description: 'Security-related content detected',
            });
        }
        if (lowerInput.includes('계약') || lowerInput.includes('예산') || lowerInput.includes('budget')) {
            tags.push({
                type: 'contract',
                level: task_types_1.RiskLevel.R2_HIGH,
                description: 'Contract or budget related content',
            });
        }
        return tags;
    }
    calculateRiskLevel(tags) {
        if (tags.length === 0)
            return task_types_1.RiskLevel.R0_LOW;
        const levels = tags.map(t => t.level);
        if (levels.includes(task_types_1.RiskLevel.R3_CRITICAL))
            return task_types_1.RiskLevel.R3_CRITICAL;
        if (levels.includes(task_types_1.RiskLevel.R2_HIGH))
            return task_types_1.RiskLevel.R2_HIGH;
        if (levels.includes(task_types_1.RiskLevel.R1_MEDIUM))
            return task_types_1.RiskLevel.R1_MEDIUM;
        return task_types_1.RiskLevel.R0_LOW;
    }
};
exports.IntakeService = IntakeService;
exports.IntakeService = IntakeService = __decorate([
    (0, common_1.Injectable)()
], IntakeService);
//# sourceMappingURL=intake.service.js.map