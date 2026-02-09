export class PolicyInjector {
    rules = new Map();
    constructor() {
        this.loadDefaultRules();
    }
    async getContext(message) {
        const applicableRules = this.findApplicableRules(message);
        return applicableRules.map(r => r.description).join("; ");
    }
    async applyRules(tool, params) {
        const modified = { ...params };
        for (const rule of this.rules.values()) {
            if (rule.appliesToTool(tool)) {
                rule.apply(modified);
            }
        }
        return modified;
    }
    findApplicableRules(message) {
        return Array.from(this.rules.values()).filter(rule => rule.matches(message));
    }
    loadDefaultRules() {
        this.rules.set("external-comm", new ExternalCommunicationRule());
        this.rules.set("pii-protection", new PIIProtectionRule());
        this.rules.set("template-enforcement", new TemplateEnforcementRule());
    }
}
class PolicyRule {
}
class ExternalCommunicationRule extends PolicyRule {
    name = "External Communication";
    description = "Requires approval for external communications";
    matches(input) {
        const keywords = ["외부", "대외", "external", "public", "publish"];
        return keywords.some(k => input.toLowerCase().includes(k.toLowerCase()));
    }
    appliesToTool(tool) {
        return ["send_email", "publish", "share"].includes(tool);
    }
    apply(params) {
        params.requireApproval = true;
        params.approvalReason = "External communication detected";
    }
}
class PIIProtectionRule extends PolicyRule {
    name = "PII Protection";
    description = "Masks personal information in outputs";
    matches(input) {
        const piiPattern = /\d{6}-\d{7}|\d{3}-\d{4}-\d{4}/;
        return piiPattern.test(input);
    }
    appliesToTool(tool) {
        return true;
    }
    apply(params) {
        params.maskPII = true;
    }
}
class TemplateEnforcementRule extends PolicyRule {
    name = "Template Enforcement";
    description = "Enforces organization templates for documents";
    matches(input) {
        const docKeywords = ["문서", "document", "report", "보고서", "회의록"];
        return docKeywords.some(k => input.toLowerCase().includes(k.toLowerCase()));
    }
    appliesToTool(tool) {
        return tool === "create_document" || tool === "generate_report";
    }
    apply(params) {
        if (!params.template) {
            params.template = "default";
        }
    }
}
//# sourceMappingURL=injector.js.map