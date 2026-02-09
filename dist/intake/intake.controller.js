"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntakeController = void 0;
const common_1 = require("@nestjs/common");
const intake_service_1 = require("./intake.service");
const create_task_request_1 = require("./dto/create-task.request");
let IntakeController = class IntakeController {
    constructor(intakeService) {
        this.intakeService = intakeService;
    }
    async createTask(request) {
        return this.intakeService.processRequest(request);
    }
};
exports.IntakeController = IntakeController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_task_request_1.CreateTaskRequest]),
    __metadata("design:returntype", Promise)
], IntakeController.prototype, "createTask", null);
exports.IntakeController = IntakeController = __decorate([
    (0, common_1.Controller)('tasks'),
    __metadata("design:paramtypes", [intake_service_1.IntakeService])
], IntakeController);
//# sourceMappingURL=intake.controller.js.map