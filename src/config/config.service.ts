import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  get openaiApiKey(): string {
    return process.env.OPENAI_API_KEY || '';
  }

  get redisUrl(): string {
    return process.env.REDIS_URL || 'redis://localhost:6379';
  }

  get rulesPath(): string {
    return process.env.RULES_PATH || './rules';
  }

  get auditLogRetentionDays(): number {
    return parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '365', 10);
  }

  get defaultApprover(): string {
    return process.env.DEFAULT_APPROVER || 'admin@organization.com';
  }
}
