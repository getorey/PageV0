import { Injectable } from '@nestjs/common';
import { SubTask } from '../../common/task.types';

@Injectable()
export class CommsAgentService {
  async process(subTask: SubTask): Promise<string> {
    const { input } = subTask;

    if (input.includes('메일') || input.includes('email')) {
      return this.generateEmail(input);
    }

    if (input.includes('공지') || input.includes('notice')) {
      return this.generateNotice(input);
    }

    return this.generateCommunication(input);
  }

  private generateEmail(input: string): string {
    return `제목: [자동생성] 업무 관련 안내\n\n안녕하세요,\n\n${input}\n\n감사합니다.\n\n---\n본 메일은 AI 업무 자동화 시스템에 의해 생성되었습니다.`;
  }

  private generateNotice(input: string): string {
    return `【공지】업무 안내\n\n${input}\n\n---\n공지일: ${new Date().toISOString()}`;
  }

  private generateCommunication(input: string): string {
    return `[커뮤니케이션]\n\n${input}\n\n---\n생성일: ${new Date().toISOString()}`;
  }
}
