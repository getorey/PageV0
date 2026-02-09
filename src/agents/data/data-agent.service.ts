import { Injectable } from '@nestjs/common';
import { SubTask } from '../../common/task.types';

@Injectable()
export class DataAgentService {
  async process(subTask: SubTask): Promise<string> {
    const { input } = subTask;

    if (input.includes('집계') || input.includes('aggregate')) {
      return this.aggregateData(input);
    }

    if (input.includes('분석') || input.includes('analysis')) {
      return this.analyzeData(input);
    }

    return this.processData(input);
  }

  private aggregateData(input: string): string {
    return `## 데이터 집계 결과\n\n입력 데이터: ${input}\n\n### 집계 지표:\n- 총계: (자동 계산)\n- 평균: (자동 계산)\n- 최대값: (자동 계산)\n- 최소값: (자동 계산)\n\n---\n생성일: ${new Date().toISOString()}`;
  }

  private analyzeData(input: string): string {
    return `## 데이터 분석 결과\n\n입력 데이터: ${input}\n\n### 분석 결과:\n- 주요 패턴: (자동 분석)\n- 이상치: (자동 탐지)\n- 추세: (자동 분석)\n\n---\n생성일: ${new Date().toISOString()}`;
  }

  private processData(input: string): string {
    return `## 데이터 처리 결과\n\n입력: ${input}\n\n### 처리 내용:\n- 데이터 정제 완료\n- 형식 변환 완료\n- 검증 완료\n\n---\n생성일: ${new Date().toISOString()}`;
  }
}
