export declare class PolicyInjector {
    private rules;
    constructor();
    getContext(message: string): Promise<string>;
    applyRules(tool: string, params: any): Promise<any>;
    private findApplicableRules;
    private loadDefaultRules;
}
//# sourceMappingURL=injector.d.ts.map