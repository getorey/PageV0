export class PolicyInjector {
  private rules: Map<string, PolicyRule> = new Map();

  constructor() {
    this.loadDefaultRules();
  }

  async getContext(message: string): Promise<string> {
    const applicableRules = this.findApplicableRules(message);
    return applicableRules.map(r => r.description).join("; ");
  }

  async applyRules(tool: string, params: any): Promise<any> {
    const modified = { ...params };
    
    for (const rule of this.rules.values()) {
      if (rule.appliesToTool(tool)) {
        rule.apply(modified);
      }
    }

    return modified;
  }

  private findApplicableRules(message: string): PolicyRule[] {
    return Array.from(this.rules.values()).filter(rule => 
      rule.matches(message)
    );
  }

  private loadDefaultRules(): void {
    this.rules.set("external-comm", new ExternalCommunicationRule());
    this.rules.set("pii-protection", new PIIProtectionRule());
    this.rules.set("template-enforcement", new TemplateEnforcementRule());
  }
}

abstract class PolicyRule {
  abstract name: string;
  abstract description: string;

  abstract matches(input: string): boolean;
  abstract appliesToTool(tool: string): boolean;
  abstract apply(params: any): void;
}

class ExternalCommunicationRule extends PolicyRule {
  name = "External Communication";
  description = "Requires approval for external communications";

  matches(input: string): boolean {
    const keywords = ["외부", "대외", "external", "public", "publish"];
    return keywords.some(k => input.toLowerCase().includes(k.toLowerCase()));
  }

  appliesToTool(tool: string): boolean {
    return ["send_email", "publish", "share"].includes(tool);
  }

  apply(params: any): void {
    params.requireApproval = true;
    params.approvalReason = "External communication detected";
  }
}

class PIIProtectionRule extends PolicyRule {
  name = "PII Protection";
  description = "Masks personal information in outputs";

  matches(input: string): boolean {
    const piiPattern = /\d{6}-\d{7}|\d{3}-\d{4}-\d{4}/;
    return piiPattern.test(input);
  }

  appliesToTool(tool: string): boolean {
    return true;
  }

  apply(params: any): void {
    params.maskPII = true;
  }
}

class TemplateEnforcementRule extends PolicyRule {
  name = "Template Enforcement";
  description = "Enforces organization templates for documents";

  matches(input: string): boolean {
    const docKeywords = ["문서", "document", "report", "보고서", "회의록"];
    return docKeywords.some(k => input.toLowerCase().includes(k.toLowerCase()));
  }

  appliesToTool(tool: string): boolean {
    return tool === "create_document" || tool === "generate_report";
  }

  apply(params: any): void {
    if (!params.template) {
      params.template = "default";
    }
  }
}
