import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowService } from './workflow.service';
import { Task, TaskState, RiskLevel } from '../common/task.types';

describe('WorkflowService', () => {
  let service: WorkflowService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkflowService],
    }).compile();

    service = module.get<WorkflowService>(WorkflowService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('state transitions', () => {
    it('should allow DRAFT to REVIEW transition', () => {
      expect(service.canTransition(TaskState.DRAFT, TaskState.REVIEW)).toBe(true);
    });

    it('should not allow invalid transitions', () => {
      expect(service.canTransition(TaskState.COMPLETED, TaskState.DRAFT)).toBe(false);
    });
  });

  describe('approval requirement', () => {
    it('should require approval for high risk tasks', () => {
      const highRiskTask: Task = {
        id: '1',
        type: 'email',
        state: TaskState.REVIEW,
        riskLevel: RiskLevel.R2_HIGH,
        title: 'Test',
        description: 'Test',
        input: 'Test',
        metadata: {
          requester: 'test@test.com',
          riskTags: [],
          auditLogId: '1',
        },
        subTasks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(service.requiresApproval(highRiskTask)).toBe(true);
    });

    it('should not require approval for low risk tasks', () => {
      const lowRiskTask: Task = {
        id: '2',
        type: 'document',
        state: TaskState.REVIEW,
        riskLevel: RiskLevel.R0_LOW,
        title: 'Test',
        description: 'Test',
        input: 'Test',
        metadata: {
          requester: 'test@test.com',
          riskTags: [],
          auditLogId: '2',
        },
        subTasks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(service.requiresApproval(lowRiskTask)).toBe(false);
    });
  });
});
