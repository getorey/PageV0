export class RiskAnalyzer {
    piiPatterns = [
        { pattern: /\d{6}-\d{7}/, type: "주민등록번호", level: "high" },
        { pattern: /\d{3}-\d{4}-\d{4}/, type: "전화번호", level: "medium" },
        { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, type: "이메일", level: "low" },
    ];
    securityKeywords = [
        "보안", "비밀", "기밀", "confidential", "secret", "classified", "password"
    ];
    externalKeywords = [
        "외부", "대외", "external", "outside", "public", "publish"
    ];
    analyzeOutput(output) {
        const outputStr = typeof output === "string" ? output : JSON.stringify(output);
        return this.analyzeContent(outputStr);
    }
    analyzeContent(content) {
        const risks = [];
        for (const { pattern, type, level } of this.piiPatterns) {
            if (pattern.test(content)) {
                risks.push({ type: "PII", level: level, description: `${type} detected` });
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
    assessPermissionRisk(permission, resource) {
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
//# sourceMappingURL=risk-analyzer.js.map