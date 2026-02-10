import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export class DebugLogger {
  private logFilePath: string;
  private static instance: DebugLogger;

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  constructor() {
    const logDir = path.join(os.homedir(), ".opencode", "logs", "ai-work-agent");
    this.ensureDirectoryExists(logDir);
    this.logFilePath = path.join(logDir, `debug-${this.getDateString()}.log`);
  }

  log(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logLine = data 
      ? `[${timestamp}] ${message} ${JSON.stringify(data)}\n`
      : `[${timestamp}] ${message}\n`;
    
    try {
      fs.appendFileSync(this.logFilePath, logLine, "utf-8");
    } catch (error) {
      // Silent fail - don't break the plugin
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

  getLogPath(): string {
    return this.logFilePath;
  }
}
