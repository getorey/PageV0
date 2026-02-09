import { Injectable } from '@nestjs/common';
import { SubTask } from '../../common/task.types';

@Injectable()
export class PmoAgentService {
  async process(subTask: SubTask): Promise<string> {
    const { input } = subTask;

    if (input.includes('일정') || input.includes('schedule')) {
      return this.generateSchedule(input);
    }

    if (input.includes('액션') || input.includes('action')) {
      return this.extractActionItems(input);
    }

    return this.generateTaskPlan(input);
  }

  private generateSchedule(input: string): string {
    return `## 일정 초안\n\n제목: (자동 생성된 일정 제목)\n일시: ${new Date().toISOString()}\n내용: ${input}\n\n참석자: (추천 참석자 목록)\n\n---\n*일정 등록은 승인 후 진행됩니다.*`;
  }

  private extractActionItems(input: string): string {
    return `## 액션 아이템\n\n${input}\n\n### 추출된 액션 아이템:\n1. [ ] 액션 아이템 1 (담당자 미지정)\n2. [ ] 액션 아이템 2 (담당자 미지정)\n3. [ ] 액션 아이템 3 (담당자 미지정)\n\n---\n마감일: (자동 계산된 마감일)`;
  }

  private generateTaskPlan(input: string): string {
    return `## 업무 계획\n\n${input}\n\n### 단계별 계획:\n1. 1단계: (자동 생성된 단계)\n2. 2단계: (자동 생성된 단계)\n3. 3단계: (자동 생성된 단계)\n\n---\n생성일: ${new Date().toISOString()}`;
  }
}
