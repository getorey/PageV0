"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PmoAgentService = void 0;
const common_1 = require("@nestjs/common");
let PmoAgentService = class PmoAgentService {
    async process(subTask) {
        const { input } = subTask;
        if (input.includes('일정') || input.includes('schedule')) {
            return this.generateSchedule(input);
        }
        if (input.includes('액션') || input.includes('action')) {
            return this.extractActionItems(input);
        }
        return this.generateTaskPlan(input);
    }
    generateSchedule(input) {
        return `## 일정 초안\n\n제목: (자동 생성된 일정 제목)\n일시: ${new Date().toISOString()}\n내용: ${input}\n\n참석자: (추천 참석자 목록)\n\n---\n*일정 등록은 승인 후 진행됩니다.*`;
    }
    extractActionItems(input) {
        return `## 액션 아이템\n\n${input}\n\n### 추출된 액션 아이템:\n1. [ ] 액션 아이템 1 (담당자 미지정)\n2. [ ] 액션 아이템 2 (담당자 미지정)\n3. [ ] 액션 아이템 3 (담당자 미지정)\n\n---\n마감일: (자동 계산된 마감일)`;
    }
    generateTaskPlan(input) {
        return `## 업무 계획\n\n${input}\n\n### 단계별 계획:\n1. 1단계: (자동 생성된 단계)\n2. 2단계: (자동 생성된 단계)\n3. 3단계: (자동 생성된 단계)\n\n---\n생성일: ${new Date().toISOString()}`;
    }
};
exports.PmoAgentService = PmoAgentService;
exports.PmoAgentService = PmoAgentService = __decorate([
    (0, common_1.Injectable)()
], PmoAgentService);
//# sourceMappingURL=pmo-agent.service.js.map