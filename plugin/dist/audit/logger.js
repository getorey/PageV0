export class AuditLogger {
    logs = [];
    async logToolAttempt(tool, params) {
        this.log({
            event: "TOOL_ATTEMPT",
            details: { tool, params: this.maskSensitive(params) },
        });
    }
    async logToolResult(tool, params, result) {
        this.log({
            event: "TOOL_RESULT",
            details: {
                tool,
                params: this.maskSensitive(params),
                result: this.truncateResult(result),
            },
        });
    }
    async logFileOperation(operation, path, risks) {
        this.log({
            event: "FILE_OPERATION",
            details: { operation, path, risks },
        });
    }
    async logSessionStart() {
        this.log({
            event: "SESSION_START",
            details: {},
        });
    }
    async logSessionEnd() {
        this.log({
            event: "SESSION_END",
            details: {},
        });
    }
    async getLogs(event) {
        if (event) {
            return this.logs.filter(l => l.event === event);
        }
        return [...this.logs];
    }
    log(partial) {
        const entry = {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            ...partial,
        };
        this.logs.push(entry);
        console.log(`[Audit] ${entry.event}:`, entry.details);
    }
    maskSensitive(data) {
        if (typeof data !== "object" || data === null)
            return data;
        const masked = { ...data };
        const patterns = [
            /password/i, /token/i, /key/i, /secret/i,
            /\d{6}-\d{7}/, /\d{3}-\d{4}-\d{4}/,
        ];
        for (const key of Object.keys(masked)) {
            if (patterns.some(p => p.test(key))) {
                masked[key] = "***MASKED***";
            }
            else if (typeof masked[key] === "string") {
                masked[key] = masked[key].replace(/\d{6}-\d{7}/g, "******-*******");
            }
        }
        return masked;
    }
    truncateResult(result) {
        const str = JSON.stringify(result);
        if (str.length > 1000) {
            return str.substring(0, 1000) + "... [truncated]";
        }
        return result;
    }
}
//# sourceMappingURL=logger.js.map