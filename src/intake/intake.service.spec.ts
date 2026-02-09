import { Test, TestingModule } from '@nestjs/testing';
import { IntakeService } from './intake.service';
import { TaskType, RiskLevel } from '../common/task.types';

describe('IntakeService', () => {
  let service: IntakeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntakeService],
    }).compile();

    service = module.get<IntakeService>(IntakeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('task classification', () => {
    it('should classify meeting-related requests', async () => {
      const result = await service.processRequest({
        title: 'Meeting Notes',
        description: 'Weekly meeting',
        input: '회의록 작성해줘',
        requester: 'test@test.com',
      });

      expect(result.type).toBe(TaskType.MEETING);
    });

    it('should classify email-related requests', async () => {
      const result = await service.processRequest({
        title: 'Email Draft',
        description: 'Draft email',
        input: '메일 본문 작성해줘',
        requester: 'test@test.com',
      });

      expect(result.type).toBe(TaskType.EMAIL);
    });
  });

  describe('risk analysis', () => {
    it('should detect external communication', async () => {
      const result = await service.processRequest({
        title: 'External Email',
        description: 'Send to client',
        input: '대외 발신 메일 작성',
        requester: 'test@test.com',
      });

      expect(result.metadata.riskTags.some(tag => tag.type === 'external')).toBe(true);
    });

    it('should detect personal information', async () => {
      const result = await service.processRequest({
        title: 'PII Test',
        description: 'Test',
        input: '주민등록번호 123456-1234567 포함',
        requester: 'test@test.com',
      });

      expect(result.metadata.riskTags.some(tag => tag.type === 'personal_info')).toBe(true);
    });
  });
});
