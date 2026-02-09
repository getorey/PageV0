import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  Task,
  TaskType,
  TaskState,
  RiskLevel,
  RiskTag,
  TaskMetadata,
} from '../common/task.types';
import { CreateTaskRequest } from './dto/create-task.request';

@Injectable()
export class IntakeService {
  async processRequest(request: CreateTaskRequest): Promise<Task> {
    const taskType = this.classifyTaskType(request.input, request.type);
    const riskTags = this.analyzeRiskTags(request.input, taskType);
    const riskLevel = this.calculateRiskLevel(riskTags);

    const task: Task = {
      id: uuidv4(),
      type: taskType,
      state: TaskState.DRAFT,
      riskLevel,
      title: request.title,
      description: request.description,
      input: request.input,
      metadata: {
        requester: request.requester,
        rulesVersion: '1.0.0',
        riskTags,
        auditLogId: uuidv4(),
      },
      subTasks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return task;
  }

  private classifyTaskType(input: string, explicitType?: TaskType): TaskType {
    if (explicitType) return explicitType;

    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('회의') || lowerInput.includes('meeting')) {
      return TaskType.MEETING;
    }
    if (lowerInput.includes('메일') || lowerInput.includes('email') || lowerInput.includes('공지')) {
      return TaskType.EMAIL;
    }
    if (lowerInput.includes('일정') || lowerInput.includes('schedule')) {
      return TaskType.SCHEDULE;
    }
    if (lowerInput.includes('데이터') || lowerInput.includes('data') || lowerInput.includes('보고서')) {
      return TaskType.DATA;
    }

    return TaskType.DOCUMENT;
  }

  private analyzeRiskTags(input: string, taskType: TaskType): RiskTag[] {
    const tags: RiskTag[] = [];
    const lowerInput = input.toLowerCase();

    // Check for external communication
    if (lowerInput.includes('외부') || lowerInput.includes('대외') || lowerInput.includes('발신')) {
      tags.push({
        type: 'external',
        level: RiskLevel.R2_HIGH,
        description: 'External communication detected',
      });
    }

    // Check for personal information
    const piiPatterns = [
      /\d{6}-\d{7}/, // Korean resident number
      /\d{3}-\d{4}-\d{4}/, // Phone number
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, // Email
    ];

    const hasPII = piiPatterns.some(pattern => pattern.test(input));
    if (hasPII || lowerInput.includes('개인정보') || lowerInput.includes('주민번호')) {
      tags.push({
        type: 'personal_info',
        level: RiskLevel.R2_HIGH,
        description: 'Personal information detected',
      });
    }

    // Check for security keywords
    if (lowerInput.includes('보안') || lowerInput.includes('비밀') || lowerInput.includes('기밀')) {
      tags.push({
        type: 'security',
        level: RiskLevel.R3_CRITICAL,
        description: 'Security-related content detected',
      });
    }

    // Check for contract/budget
    if (lowerInput.includes('계약') || lowerInput.includes('예산') || lowerInput.includes('budget')) {
      tags.push({
        type: 'contract',
        level: RiskLevel.R2_HIGH,
        description: 'Contract or budget related content',
      });
    }

    return tags;
  }

  private calculateRiskLevel(tags: RiskTag[]): RiskLevel {
    if (tags.length === 0) return RiskLevel.R0_LOW;

    const levels = tags.map(t => t.level);
    if (levels.includes(RiskLevel.R3_CRITICAL)) return RiskLevel.R3_CRITICAL;
    if (levels.includes(RiskLevel.R2_HIGH)) return RiskLevel.R2_HIGH;
    if (levels.includes(RiskLevel.R1_MEDIUM)) return RiskLevel.R1_MEDIUM;
    return RiskLevel.R0_LOW;
  }
}
