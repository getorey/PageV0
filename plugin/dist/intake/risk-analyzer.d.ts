export interface Risk {
    type: string;
    level: "low" | "medium" | "high" | "critical";
    description: string;
}
export declare class RiskAnalyzer {
    private piiPatterns;
    private securityKeywords;
    private externalKeywords;
    analyzeOutput(output: any): Risk[];
    analyzeContent(content: string): Risk[];
    assessPermissionRisk(permission: string, resource: string): string;
}
//# sourceMappingURL=risk-analyzer.d.ts.map