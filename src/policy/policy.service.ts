import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

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

@Injectable()
export class PolicyService {
  private rules: OrganizationRule[] = [];
  private templates: Map<string, Template> = new Map();

  constructor() {
    this.loadDefaultRules();
    this.loadDefaultTemplates();
  }

  async getApplicableRules(taskType: string, riskLevel: string): Promise<OrganizationRule[]> {
    return this.rules.filter(rule =>
      rule.appliesTo.includes(taskType) || rule.appliesTo.includes('*'),
    );
  }

  async getTemplate(templateId: string): Promise<Template | undefined> {
    return this.templates.get(templateId);
  }

  async applyRules(input: string, taskType: string): Promise<{
    modifiedInput: string;
    tags: string[];
    requiredApprovals: string[];
  }> {
    const applicableRules = await this.getApplicableRules(taskType, '');
    const tags: string[] = [];
    const requiredApprovals: string[] = [];
    let modifiedInput = input;

    for (const rule of applicableRules) {
      const matches = this.evaluateConditions(input, rule.conditions);
      if (matches) {
        for (const action of rule.actions) {
          switch (action.type) {
            case 'add_tag':
              tags.push(action.params.tag);
              break;
            case 'require_approval':
              requiredApprovals.push(action.params.approver);
              break;
            case 'apply_template':
              const template = await this.getTemplate(action.params.templateId);
              if (template) {
                modifiedInput = template.content.replace('{{content}}', input);
              }
              break;
          }
        }
      }
    }

    return { modifiedInput, tags, requiredApprovals };
  }

  private evaluateConditions(input: string, conditions: RuleCondition[]): boolean {
    return conditions.every(condition => {
      switch (condition.operator) {
        case 'equals':
          return input === condition.value;
        case 'contains':
          return input.toLowerCase().includes(condition.value.toLowerCase());
        case 'regex':
          return new RegExp(condition.value).test(input);
        default:
          return false;
      }
    });
  }

  private loadDefaultRules(): void {
    this.rules = [
      {
        id: 'rule-001',
        name: 'External Communication Rule',
        description: 'Require approval for external communications',
        appliesTo: ['email', 'meeting'],
        conditions: [
          { field: 'input', operator: 'contains', value: '외부' },
        ],
        actions: [
          { type: 'require_approval', params: { approver: 'manager' } },
          { type: 'add_tag', params: { tag: 'external-communication' } },
        ],
      },
      {
        id: 'rule-002',
        name: 'Personal Information Rule',
        description: 'Require approval for PII handling',
        appliesTo: ['*'],
        conditions: [
          { field: 'input', operator: 'regex', value: '\\d{6}-\\d{7}' },
        ],
        actions: [
          { type: 'require_approval', params: { approver: 'security-team' } },
          { type: 'add_tag', params: { tag: 'pii-detected' } },
        ],
      },
    ];
  }

  private loadDefaultTemplates(): void {
    this.templates.set('meeting-minutes', {
      id: 'meeting-minutes',
      name: 'Standard Meeting Minutes',
      type: 'document',
      content: `# 회의록\n\n## 회의 개요\n{{content}}\n\n## 결정사항\n(자동 추출)\n\n## 액션 아이템\n(자동 추출)\n\n---\n생성일: ${new Date().toISOString()}`,
    });

    this.templates.set('formal-email', {
      id: 'formal-email',
      name: 'Formal Email',
      type: 'email',
      content: `제목: [업무안내] {{subject}}\n\n안녕하세요,\n\n{{content}}\n\n감사합니다.`,
    });
  }
}
