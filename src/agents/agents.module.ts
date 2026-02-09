import { Module } from '@nestjs/common';
import { DocAgentService } from './doc/doc-agent.service';
import { CommsAgentService } from './comms/comms-agent.service';
import { PmoAgentService } from './pmo/pmo-agent.service';
import { ComplianceAgentService } from './compliance/compliance-agent.service';
import { DataAgentService } from './data/data-agent.service';

@Module({
  providers: [
    DocAgentService,
    CommsAgentService,
    PmoAgentService,
    ComplianceAgentService,
    DataAgentService,
  ],
  exports: [
    DocAgentService,
    CommsAgentService,
    PmoAgentService,
    ComplianceAgentService,
    DataAgentService,
  ],
})
export class AgentsModule {}
