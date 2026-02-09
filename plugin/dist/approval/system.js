export class ApprovalSystem {
    client;
    pendingApprovals = new Map();
    constructor(client) {
        this.client = client;
    }
    async requestApproval(tool, params) {
        const requestId = `approval_${Date.now()}`;
        const request = {
            id: requestId,
            tool,
            params: this.sanitizeParams(params),
            requestedAt: new Date(),
        };
        this.pendingApprovals.set(requestId, request);
        const approved = await this.client.session.confirm({
            message: `Approval required for: ${tool}`,
            detail: `Parameters: ${JSON.stringify(request.params, null, 2)}`,
        });
        if (approved) {
            request.approved = true;
            request.approvedAt = new Date();
        }
        return approved;
    }
    async getPendingApprovals() {
        return Array.from(this.pendingApprovals.values()).filter(r => !r.approved);
    }
    sanitizeParams(params) {
        const sensitive = ["password", "token", "key", "secret"];
        const sanitized = { ...params };
        for (const key of Object.keys(sanitized)) {
            if (sensitive.some(s => key.toLowerCase().includes(s))) {
                sanitized[key] = "***REDACTED***";
            }
        }
        return sanitized;
    }
}
//# sourceMappingURL=system.js.map