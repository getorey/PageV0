"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyService = void 0;
const common_1 = require("@nestjs/common");
let PolicyService = class PolicyService {
    constructor() {
        this.rules = [];
        this.templates = new Map();
        this.loadDefaultRules();
        this.loadDefaultTemplates();
    }
    async getApplicableRules(taskType, riskLevel) {
        return this.rules.filter(rule => rule.appliesTo.includes(taskType) || rule.appliesTo.includes('*'));
    }
    async getTemplate(templateId) {
        return this.templates.get(templateId);
    }
    async applyRules(input, taskType) {
        const applicableRules = await this.getApplicableRules(taskType, '');
        const tags = [];
        const requiredApprovals = [];
        let modifiedInput = input;
        for (const rule of applicableRules) {
            const matches = this.evaluateConditions(input, rule.conditions);
            if (matches) {
                for (const action of rule.actions) {
                    switch (action.type) {
                        case 'add_tag':
                            tags.push(action.params.tag);
                            break;
                        case 'require_approval':
                            requiredApprovals.push(action.params.approver);
                            break;
                        case 'apply_template':
                            const template = await this.getTemplate(action.params.templateId);
                            if (template) {
                                modifiedInput = template.content.replace('{{content}}', input);
                            }
                            break;
                    }
                }
            }
        }
        return { modifiedInput, tags, requiredApprovals };
    }
    evaluateConditions(input, conditions) {
        return conditions.every(condition => {
            switch (condition.operator) {
                case 'equals':
                    return input === condition.value;
                case 'contains':
                    return input.toLowerCase().includes(condition.value.toLowerCase());
                case 'regex':
                    return new RegExp(condition.value).test(input);
                default:
                    return false;
            }
        });
    }
    loadDefaultRules() {
        this.rules = [
            {
                id: 'rule-001',
                name: 'External Communication Rule',
                description: 'Require approval for external communications',
                appliesTo: ['email', 'meeting'],
                conditions: [
                    { field: 'input', operator: 'contains', value: '외부' },
                ],
                actions: [
                    { type: 'require_approval', params: { approver: 'manager' } },
                    { type: 'add_tag', params: { tag: 'external-communication' } },
                ],
            },
            {
                id: 'rule-002',
                name: 'Personal Information Rule',
                description: 'Require approval for PII handling',
                appliesTo: ['*'],
                conditions: [
                    { field: 'input', operator: 'regex', value: '\\d{6}-\\d{7}' },
                ],
                actions: [
                    { type: 'require_approval', params: { approver: 'security-team' } },
                    { type: 'add_tag', params: { tag: 'pii-detected' } },
                ],
            },
        ];
    }
    loadDefaultTemplates() {
        this.templates.set('meeting-minutes', {
            id: 'meeting-minutes',
            name: 'Standard Meeting Minutes',
            type: 'document',
            content: `# 회의록\n\n## 회의 개요\n{{content}}\n\n## 결정사항\n(자동 추출)\n\n## 액션 아이템\n(자동 추출)\n\n---\n생성일: ${new Date().toISOString()}`,
        });
        this.templates.set('formal-email', {
            id: 'formal-email',
            name: 'Formal Email',
            type: 'email',
            content: `제목: [업무안내] {{subject}}\n\n안녕하세요,\n\n{{content}}\n\n감사합니다.`,
        });
    }
};
exports.PolicyService = PolicyService;
exports.PolicyService = PolicyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PolicyService);
//# sourceMappingURL=policy.service.js.map