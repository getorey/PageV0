import { Module } from '@nestjs/common';
import { IntakeModule } from './intake/intake.module';
import { OrchestratorModule } from './orchestrator/orchestrator.module';
import { AgentsModule } from './agents/agents.module';
import { WorkflowModule } from './workflow/workflow.module';
import { ApprovalModule } from './approval/approval.module';
import { AuditModule } from './audit/audit.module';
import { PolicyModule } from './policy/policy.module';
import { ConfigModule } from './config/config.module';
import { AppLogger } from './common/logger.service';
import { DebugController } from './common/debug.controller';

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
  controllers: [DebugController],
  providers: [AppLogger],
  exports: [AppLogger],
})
export class AppModule {}
