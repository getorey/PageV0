interface OrganizationRule {
    id: string;
    name: string;
    description: string;
    appliesTo: string[];
    conditions: RuleCondition[];
    actions: RuleAction[];
}
interface RuleCondition {
    field: string;
    operator: 'equals' | 'contains' | 'regex';
    value: string;
}
interface RuleAction {
    type: 'require_approval' | 'add_tag' | 'apply_template' | 'block';
    params: Record<string, any>;
}
interface Template {
    id: string;
    name: string;
    type: string;
    content: string;
}
export declare class PolicyService {
    private rules;
    private templates;
    constructor();
    getApplicableRules(taskType: string, riskLevel: string): Promise<OrganizationRule[]>;
    getTemplate(templateId: string): Promise<Template | undefined>;
    applyRules(input: string, taskType: string): Promise<{
        modifiedInput: string;
        tags: string[];
        requiredApprovals: string[];
    }>;
    private evaluateConditions;
    private loadDefaultRules;
    private loadDefaultTemplates;
}
export {};
