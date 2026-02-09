"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentType = exports.RiskLevel = exports.TaskState = exports.TaskType = void 0;
var TaskType;
(function (TaskType) {
    TaskType["MEETING"] = "meeting";
    TaskType["DOCUMENT"] = "document";
    TaskType["EMAIL"] = "email";
    TaskType["SCHEDULE"] = "schedule";
    TaskType["DATA"] = "data";
    TaskType["APPROVAL"] = "approval";
})(TaskType || (exports.TaskType = TaskType = {}));
var TaskState;
(function (TaskState) {
    TaskState["DRAFT"] = "draft";
    TaskState["REVIEW"] = "review";
    TaskState["APPROVAL_REQUIRED"] = "approval_required";
    TaskState["APPROVED"] = "approved";
    TaskState["COMPLETED"] = "completed";
    TaskState["ARCHIVED"] = "archived";
})(TaskState || (exports.TaskState = TaskState = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["R0_LOW"] = "r0_low";
    RiskLevel["R1_MEDIUM"] = "r1_medium";
    RiskLevel["R2_HIGH"] = "r2_high";
    RiskLevel["R3_CRITICAL"] = "r3_critical";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
var AgentType;
(function (AgentType) {
    AgentType["ORCHESTRATOR"] = "orchestrator";
    AgentType["DOC"] = "doc";
    AgentType["COMMS"] = "comms";
    AgentType["PMO"] = "pmo";
    AgentType["DATA"] = "data";
    AgentType["RESEARCH"] = "research";
    AgentType["COMPLIANCE"] = "compliance";
    AgentType["OPS"] = "ops";
})(AgentType || (exports.AgentType = AgentType = {}));
//# sourceMappingURL=task.types.js.map