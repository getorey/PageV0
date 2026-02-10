import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  event: string;
  user?: string;
  details: Record<string, any>;
}

export class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private logFilePath: string;
  private readonly maxLogFileSize = 10 * 1024 * 1024; // 10MB

  constructor() {
    // 로그 파일 경로 설정: ~/.opencode/logs/ai-work-agent/
    const logDir = path.join(os.homedir(), ".opencode", "logs", "ai-work-agent");
    this.ensureDirectoryExists(logDir);
    this.logFilePath = path.join(logDir, `audit-${this.getDateString()}.log`);
  }

  async logToolAttempt(tool: string, params: any): Promise<void> {
    this.logInternal({
      event: "TOOL_ATTEMPT",
      details: { tool, params: this.maskSensitive(params) },
    });
  }

  async logToolResult(tool: string, params: any, result: any): Promise<void> {
    this.logInternal({
      event: "TOOL_RESULT",
      details: { 
        tool, 
        params: this.maskSensitive(params),
        result: this.truncateResult(result),
      },
    });
  }

  async logFileOperation(operation: string, filePath: string, risks: Risk[]): Promise<void> {
    this.logInternal({
      event: "FILE_OPERATION",
      details: { operation, path: filePath, risks },
    });
  }

  async logSessionStart(): Promise<void> {
    this.logInternal({
      event: "SESSION_START",
      details: {},
    });
  }

  async logSessionEnd(): Promise<void> {
    this.logInternal({
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

  async log(event: string, details: Record<string, any>): Promise<void> {
    this.logInternal({
      event,
      details,
    });
  }

  private logInternal(partial: Omit<AuditLogEntry, "id" | "timestamp">): void {
    const entry: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...partial,
    };
    this.logs.push(entry);
    this.writeToFile(entry);
  }

  private writeToFile(entry: AuditLogEntry): void {
    try {
      if (this.shouldRotateLogFile()) {
        this.rotateLogFile();
      }

      const logLine = JSON.stringify({
        id: entry.id,
        timestamp: entry.timestamp.toISOString(),
        event: entry.event,
        user: entry.user,
        details: entry.details,
      }) + "\n";

      fs.appendFileSync(this.logFilePath, logLine, "utf-8");
    } catch (error) {
      console.error("[AuditLogger] Failed to write log to file:", error);
    }
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private getDateString(): string {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  }

  private shouldRotateLogFile(): boolean {
    try {
      if (!fs.existsSync(this.logFilePath)) {
        return false;
      }
      const stats = fs.statSync(this.logFilePath);
      return stats.size > this.maxLogFileSize;
    } catch {
      return false;
    }
  }

  private rotateLogFile(): void {
    const timestamp = Date.now();
    const rotatedPath = `${this.logFilePath}.${timestamp}`;
    try {
      fs.renameSync(this.logFilePath, rotatedPath);
      console.log(`[AuditLogger] Log file rotated: ${rotatedPath}`);
    } catch (error) {
      console.error("[AuditLogger] Failed to rotate log file:", error);
    }
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
    if (result === undefined || result === null) return result;

    try {
      const str = JSON.stringify(result);
      if (str && str.length > 1000) {
        return str.substring(0, 1000) + "... [truncated]";
      }
    } catch (e) {
      return String(result);
    }
    return result;
  }
}

interface Risk {
  level: string;
  description: string;
}
