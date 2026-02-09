import { Injectable } from '@nestjs/common';
import { SubTask } from '../../common/task.types';

@Injectable()
export class DocAgentService {
  async process(subTask: SubTask): Promise<string> {
    const { input } = subTask;

    if (input.includes('회의록') || input.includes('meeting minutes')) {
      return this.generateMeetingMinutes(input);
    }

    if (input.includes('보고서') || input.includes('report')) {
      return this.generateReport(input);
    }

    return this.generateGeneralDocument(input);
  }

  private generateMeetingMinutes(input: string): string {
    return `# 회의록\n\n## 개요\n${input}\n\n## 결정사항\n- (자동 추출된 결정사항)\n\n## 후속조치\n- (자동 추출된 액션아이템)\n\n작성일: ${new Date().toISOString()}`;
  }

  private generateReport(input: string): string {
    return `# 업무 보고서\n\n## 요약\n${input}\n\n## 상세 내용\n- (자동 생성된 상세 내용)\n\n## 결론\n- (자동 생성된 결론)\n\n작성일: ${new Date().toISOString()}`;
  }

  private generateGeneralDocument(input: string): string {
    return `# 문서\n\n${input}\n\n---\n생성일: ${new Date().toISOString()}`;
  }
}
