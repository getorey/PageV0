"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigService = void 0;
const common_1 = require("@nestjs/common");
let ConfigService = class ConfigService {
    get openaiApiKey() {
        return process.env.OPENAI_API_KEY || '';
    }
    get redisUrl() {
        return process.env.REDIS_URL || 'redis://localhost:6379';
    }
    get rulesPath() {
        return process.env.RULES_PATH || './rules';
    }
    get auditLogRetentionDays() {
        return parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || '365', 10);
    }
    get defaultApprover() {
        return process.env.DEFAULT_APPROVER || 'admin@organization.com';
    }
};
exports.ConfigService = ConfigService;
exports.ConfigService = ConfigService = __decorate([
    (0, common_1.Injectable)()
], ConfigService);
//# sourceMappingURL=config.service.js.map