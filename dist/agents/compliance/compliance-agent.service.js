"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceAgentService = void 0;
const common_1 = require("@nestjs/common");
const task_types_1 = require("../../common/task.types");
let ComplianceAgentService = class ComplianceAgentService {
    constructor() {
        this.piiPatterns = [
            { pattern: /\d{6}-\d{7}/, type: '주민등록번호' },
            { pattern: /\d{3}-\d{4}-\d{4}/, type: '전화번호' },
            { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, type: '이메일' },
            { pattern: /\d{4}-\d{4}-\d{4}-\d{4}/, type: '카드번호' },
        ];
        this.securityKeywords = [
            '보안', '비밀', '기밀', 'confidential', 'secret', 'classified'
        ];
        this.externalKeywords = [
            '외부', '대외', 'external', 'outside', 'public'
        ];
    }
    async process(subTask) {
        const { input } = subTask;
        const piiFindings = this.detectPII(input);
        const securityFindings = this.detectSecurityIssues(input);
        const externalFindings = this.detectExternalCommunication(input);
        const findings = [...piiFindings, ...securityFindings, ...externalFindings];
        if (findings.length === 0) {
            return `## Compliance Review\n\n✅ 검토 완료: 위험 요소가 발견되지 않았습니다.\n\n검토일: ${new Date().toISOString()}`;
        }
        return `## Compliance Review\n\n⚠️ 발견된 위험 요소:\n${findings.map(f => `- ${f}`).join('\n')}\n\n---\n권고사항: 승인 게이트를 통과해야 합니다.\n검토일: ${new Date().toISOString()}`;
    }
    detectPII(input) {
        const findings = [];
        for (const { pattern, type } of this.piiPatterns) {
            if (pattern.test(input)) {
                findings.push(`개인정보(${type})가 포함되어 있습니다.`);
            }
        }
        if (input.includes('주민등록') || input.includes('개인정보')) {
            findings.push('개인정보 관련 키워드가 포함되어 있습니다.');
        }
        return findings;
    }
    detectSecurityIssues(input) {
        const findings = [];
        for (const keyword of this.securityKeywords) {
            if (input.toLowerCase().includes(keyword.toLowerCase())) {
                findings.push(`보안 관련 키워드("${keyword}")가 포함되어 있습니다.`);
                break;
            }
        }
        return findings;
    }
    detectExternalCommunication(input) {
        const findings = [];
        for (const keyword of this.externalKeywords) {
            if (input.toLowerCase().includes(keyword.toLowerCase())) {
                findings.push(`대외 발신 가능성이 감지되었습니다("${keyword}").`);
                break;
            }
        }
        return findings;
    }
    calculateRiskLevel(input) {
        const findings = [
            ...this.detectPII(input),
            ...this.detectSecurityIssues(input),
            ...this.detectExternalCommunication(input),
        ];
        if (findings.some(f => f.includes('보안')))
            return task_types_1.RiskLevel.R3_CRITICAL;
        if (findings.some(f => f.includes('개인정보')))
            return task_types_1.RiskLevel.R2_HIGH;
        if (findings.some(f => f.includes('대외')))
            return task_types_1.RiskLevel.R2_HIGH;
        return task_types_1.RiskLevel.R0_LOW;
    }
};
exports.ComplianceAgentService = ComplianceAgentService;
exports.ComplianceAgentService = ComplianceAgentService = __decorate([
    (0, common_1.Injectable)()
], ComplianceAgentService);
//# sourceMappingURL=compliance-agent.service.js.map