import { Injectable } from '@nestjs/common';
import { SubTask, RiskLevel } from '../../common/task.types';

@Injectable()
export class ComplianceAgentService {
  private readonly piiPatterns = [
    { pattern: /\d{6}-\d{7}/, type: '주민등록번호' },
    { pattern: /\d{3}-\d{4}-\d{4}/, type: '전화번호' },
    { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, type: '이메일' },
    { pattern: /\d{4}-\d{4}-\d{4}-\d{4}/, type: '카드번호' },
  ];

  private readonly securityKeywords = [
    '보안', '비밀', '기밀', 'confidential', 'secret', 'classified'
  ];

  private readonly externalKeywords = [
    '외부', '대외', 'external', 'outside', 'public'
  ];

  async process(subTask: SubTask): Promise<string> {
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

  private detectPII(input: string): string[] {
    const findings: string[] = [];

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

  private detectSecurityIssues(input: string): string[] {
    const findings: string[] = [];

    for (const keyword of this.securityKeywords) {
      if (input.toLowerCase().includes(keyword.toLowerCase())) {
        findings.push(`보안 관련 키워드("${keyword}")가 포함되어 있습니다.`);
        break;
      }
    }

    return findings;
  }

  private detectExternalCommunication(input: string): string[] {
    const findings: string[] = [];

    for (const keyword of this.externalKeywords) {
      if (input.toLowerCase().includes(keyword.toLowerCase())) {
        findings.push(`대외 발신 가능성이 감지되었습니다("${keyword}").`);
        break;
      }
    }

    return findings;
  }

  calculateRiskLevel(input: string): RiskLevel {
    const findings = [
      ...this.detectPII(input),
      ...this.detectSecurityIssues(input),
      ...this.detectExternalCommunication(input),
    ];

    if (findings.some(f => f.includes('보안'))) return RiskLevel.R3_CRITICAL;
    if (findings.some(f => f.includes('개인정보'))) return RiskLevel.R2_HIGH;
    if (findings.some(f => f.includes('대외'))) return RiskLevel.R2_HIGH;

    return RiskLevel.R0_LOW;
  }
}
