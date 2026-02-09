"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsModule = void 0;
const common_1 = require("@nestjs/common");
const doc_agent_service_1 = require("./doc/doc-agent.service");
const comms_agent_service_1 = require("./comms/comms-agent.service");
const pmo_agent_service_1 = require("./pmo/pmo-agent.service");
const compliance_agent_service_1 = require("./compliance/compliance-agent.service");
const data_agent_service_1 = require("./data/data-agent.service");
let AgentsModule = class AgentsModule {
};
exports.AgentsModule = AgentsModule;
exports.AgentsModule = AgentsModule = __decorate([
    (0, common_1.Module)({
        providers: [
            doc_agent_service_1.DocAgentService,
            comms_agent_service_1.CommsAgentService,
            pmo_agent_service_1.PmoAgentService,
            compliance_agent_service_1.ComplianceAgentService,
            data_agent_service_1.DataAgentService,
        ],
        exports: [
            doc_agent_service_1.DocAgentService,
            comms_agent_service_1.CommsAgentService,
            pmo_agent_service_1.PmoAgentService,
            compliance_agent_service_1.ComplianceAgentService,
            data_agent_service_1.DataAgentService,
        ],
    })
], AgentsModule);
//# sourceMappingURL=agents.module.js.map