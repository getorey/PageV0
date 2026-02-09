import { SubTask, RiskLevel } from '../../common/task.types';
export declare class ComplianceAgentService {
    private readonly piiPatterns;
    private readonly securityKeywords;
    private readonly externalKeywords;
    process(subTask: SubTask): Promise<string>;
    private detectPII;
    private detectSecurityIssues;
    private detectExternalCommunication;
    calculateRiskLevel(input: string): RiskLevel;
}
