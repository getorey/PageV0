"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const intake_module_1 = require("./intake/intake.module");
const orchestrator_module_1 = require("./orchestrator/orchestrator.module");
const agents_module_1 = require("./agents/agents.module");
const workflow_module_1 = require("./workflow/workflow.module");
const approval_module_1 = require("./approval/approval.module");
const audit_module_1 = require("./audit/audit.module");
const policy_module_1 = require("./policy/policy.module");
const config_module_1 = require("./config/config.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_1.ConfigModule,
            intake_module_1.IntakeModule,
            orchestrator_module_1.OrchestratorModule,
            agents_module_1.AgentsModule,
            workflow_module_1.WorkflowModule,
            approval_module_1.ApprovalModule,
            audit_module_1.AuditModule,
            policy_module_1.PolicyModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map