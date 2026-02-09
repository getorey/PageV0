"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocAgentService = void 0;
const common_1 = require("@nestjs/common");
let DocAgentService = class DocAgentService {
    async process(subTask) {
        const { input } = subTask;
        if (input.includes('회의록') || input.includes('meeting minutes')) {
            return this.generateMeetingMinutes(input);
        }
        if (input.includes('보고서') || input.includes('report')) {
            return this.generateReport(input);
        }
        return this.generateGeneralDocument(input);
    }
    generateMeetingMinutes(input) {
        return `# 회의록\n\n## 개요\n${input}\n\n## 결정사항\n- (자동 추출된 결정사항)\n\n## 후속조치\n- (자동 추출된 액션아이템)\n\n작성일: ${new Date().toISOString()}`;
    }
    generateReport(input) {
        return `# 업무 보고서\n\n## 요약\n${input}\n\n## 상세 내용\n- (자동 생성된 상세 내용)\n\n## 결론\n- (자동 생성된 결론)\n\n작성일: ${new Date().toISOString()}`;
    }
    generateGeneralDocument(input) {
        return `# 문서\n\n${input}\n\n---\n생성일: ${new Date().toISOString()}`;
    }
};
exports.DocAgentService = DocAgentService;
exports.DocAgentService = DocAgentService = __decorate([
    (0, common_1.Injectable)()
], DocAgentService);
//# sourceMappingURL=doc-agent.service.js.map