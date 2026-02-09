"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommsAgentService = void 0;
const common_1 = require("@nestjs/common");
let CommsAgentService = class CommsAgentService {
    async process(subTask) {
        const { input } = subTask;
        if (input.includes('메일') || input.includes('email')) {
            return this.generateEmail(input);
        }
        if (input.includes('공지') || input.includes('notice')) {
            return this.generateNotice(input);
        }
        return this.generateCommunication(input);
    }
    generateEmail(input) {
        return `제목: [자동생성] 업무 관련 안내\n\n안녕하세요,\n\n${input}\n\n감사합니다.\n\n---\n본 메일은 AI 업무 자동화 시스템에 의해 생성되었습니다.`;
    }
    generateNotice(input) {
        return `【공지】업무 안내\n\n${input}\n\n---\n공지일: ${new Date().toISOString()}`;
    }
    generateCommunication(input) {
        return `[커뮤니케이션]\n\n${input}\n\n---\n생성일: ${new Date().toISOString()}`;
    }
};
exports.CommsAgentService = CommsAgentService;
exports.CommsAgentService = CommsAgentService = __decorate([
    (0, common_1.Injectable)()
], CommsAgentService);
//# sourceMappingURL=comms-agent.service.js.map