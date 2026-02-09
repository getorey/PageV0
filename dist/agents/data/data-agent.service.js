"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataAgentService = void 0;
const common_1 = require("@nestjs/common");
let DataAgentService = class DataAgentService {
    async process(subTask) {
        const { input } = subTask;
        if (input.includes('집계') || input.includes('aggregate')) {
            return this.aggregateData(input);
        }
        if (input.includes('분석') || input.includes('analysis')) {
            return this.analyzeData(input);
        }
        return this.processData(input);
    }
    aggregateData(input) {
        return `## 데이터 집계 결과\n\n입력 데이터: ${input}\n\n### 집계 지표:\n- 총계: (자동 계산)\n- 평균: (자동 계산)\n- 최대값: (자동 계산)\n- 최소값: (자동 계산)\n\n---\n생성일: ${new Date().toISOString()}`;
    }
    analyzeData(input) {
        return `## 데이터 분석 결과\n\n입력 데이터: ${input}\n\n### 분석 결과:\n- 주요 패턴: (자동 분석)\n- 이상치: (자동 탐지)\n- 추세: (자동 분석)\n\n---\n생성일: ${new Date().toISOString()}`;
    }
    processData(input) {
        return `## 데이터 처리 결과\n\n입력: ${input}\n\n### 처리 내용:\n- 데이터 정제 완료\n- 형식 변환 완료\n- 검증 완료\n\n---\n생성일: ${new Date().toISOString()}`;
    }
};
exports.DataAgentService = DataAgentService;
exports.DataAgentService = DataAgentService = __decorate([
    (0, common_1.Injectable)()
], DataAgentService);
//# sourceMappingURL=data-agent.service.js.map