export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  event: string;
  user?: string;
  details: Record<string, any>;
}

export class AuditLogger {
  private logs: AuditLogEntry[] = [];

  async logToolAttempt(tool: string, params: any): Promise<void> {
    this.log({
      event: "TOOL_ATTEMPT",
      details: { tool, params: this.maskSensitive(params) },
    });
  }

  async logToolResult(tool: string, params: any, result: any): Promise<void> {
    this.log({
      event: "TOOL_RESULT",
      details: { 
        tool, 
        params: this.maskSensitive(params),
        result: this.truncateResult(result),
      },
    });
  }

  async logFileOperation(operation: string, path: string, risks: Risk[]): Promise<void> {
    this.log({
      event: "FILE_OPERATION",
      details: { operation, path, risks },
    });
  }

  async logSessionStart(): Promise<void> {
    this.log({
      event: "SESSION_START",
      details: {},
    });
  }

  async logSessionEnd(): Promise<void> {
    this.log({
      event: "SESSION_END",
      details: {},
    });
  }

  async getLogs(event?: string): Promise<AuditLogEntry[]> {
    if (event) {
      return this.logs.filter(l => l.event === event);
    }
    return [...this.logs];
  }

  private log(partial: Omit<AuditLogEntry, "id" | "timestamp">): void {
    const entry: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...partial,
    };
    this.logs.push(entry);
    console.log(`[Audit] ${entry.event}:`, entry.details);
  }

  private maskSensitive(data: any): any {
    if (typeof data !== "object" || data === null) return data;
    
    const masked = { ...data };
    const patterns = [
      /password/i, /token/i, /key/i, /secret/i,
      /\d{6}-\d{7}/, /\d{3}-\d{4}-\d{4}/,
    ];

    for (const key of Object.keys(masked)) {
      if (patterns.some(p => p.test(key))) {
        masked[key] = "***MASKED***";
      } else if (typeof masked[key] === "string") {
        masked[key] = masked[key].replace(/\d{6}-\d{7}/g, "******-*******");
      }
    }

    return masked;
  }

  private truncateResult(result: any): any {
    const str = JSON.stringify(result);
    if (str.length > 1000) {
      return str.substring(0, 1000) + "... [truncated]";
    }
    return result;
  }
}

interface Risk {
  level: string;
  description: string;
}
