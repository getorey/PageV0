import { Module } from '@nestjs/common';
import { IntakeModule } from './intake/intake.module';
import { OrchestratorModule } from './orchestrator/orchestrator.module';
import { AgentsModule } from './agents/agents.module';
import { WorkflowModule } from './workflow/workflow.module';
import { ApprovalModule } from './approval/approval.module';
import { AuditModule } from './audit/audit.module';
import { PolicyModule } from './policy/policy.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [
    ConfigModule,
    IntakeModule,
    OrchestratorModule,
    AgentsModule,
    WorkflowModule,
    ApprovalModule,
    AuditModule,
    PolicyModule,
  ],
})
export class AppModule {}
