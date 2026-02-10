export interface Risk {
  type: string;
  level: "low" | "medium" | "high" | "critical";
  description: string;
}

export class RiskAnalyzer {
  private piiPatterns = [
    { pattern: /\d{6}-\d{7}/, type: "주민등록번호", level: "high" },
    { pattern: /\d{3}-\d{4}-\d{4}/, type: "전화번호", level: "medium" },
    { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, type: "이메일", level: "low" },
  ];

  private securityKeywords = [
    "보안", "비밀", "기밀", "confidential", "secret", "classified", "password"
  ];

  private externalKeywords = [
    "외부", "대외", "external", "outside", "public", "publish"
  ];

  analyzeOutput(output: any): Risk[] {
    const outputStr = typeof output === "string" ? output : JSON.stringify(output);
    return this.analyzeContent(outputStr);
  }

  analyzeContent(content: string): Risk[] {
    if (!content || typeof content !== 'string') return [];

    const risks: Risk[] = [];

    for (const { pattern, type, level } of this.piiPatterns) {
      if (pattern.test(content)) {
        risks.push({ type: "PII", level: level as any, description: `${type} detected` });
      }
    }

    for (const keyword of this.securityKeywords) {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        risks.push({ 
          type: "SECURITY", 
          level: "high", 
          description: `Security keyword: ${keyword}` 
        });
        break;
      }
    }

    for (const keyword of this.externalKeywords) {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        risks.push({ 
          type: "EXTERNAL", 
          level: "medium", 
          description: `External communication: ${keyword}` 
        });
        break;
      }
    }

    return risks;
  }

  assessPermissionRisk(permission: string, resource: string): string {
    const highRisk = ["write", "delete", "modify", "publish", "share"];
    const mediumRisk = ["read", "access", "view"];

    if (highRisk.some(r => permission.toLowerCase().includes(r))) {
      return "high";
    }
    if (mediumRisk.some(r => permission.toLowerCase().includes(r))) {
      return "medium";
    }
    return "low";
  }
}
