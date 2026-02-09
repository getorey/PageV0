import { Injectable, Logger, LogLevel } from '@nestjs/common';
import { ConfigService } from './config/config.service';

interface LogEntry {
  timestamp: string;
  level: string;
  context: string;
  message: string;
  data?: any;
}

@Injectable()
export class AppLogger {
  private readonly logger = new Logger('App');
  private readonly auditLogger = new Logger('Audit');
  private logLevel: LogLevel = 'log';
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  constructor(private readonly configService: ConfigService) {
    this.setLogLevelFromEnv();
  }

  private setLogLevelFromEnv() {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase();
    const levels: LogLevel[] = ['verbose', 'debug', 'log', 'warn', 'error'];
    
    if (envLevel && levels.includes(envLevel as LogLevel)) {
      this.logLevel = envLevel as LogLevel;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['verbose', 'debug', 'log', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private addToBuffer(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  verbose(message: string, context?: string, data?: any) {
    if (this.shouldLog('verbose')) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'VERBOSE',
        context: context || 'App',
        message,
        data,
      };
      this.addToBuffer(entry);
      this.logger.verbose(message, context);
    }
  }

  debug(message: string, context?: string, data?: any) {
    if (this.shouldLog('debug')) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'DEBUG',
        context: context || 'App',
        message,
        data,
      };
      this.addToBuffer(entry);
      this.logger.debug(message, context);
      
      // 디버그 모드일 때는 콘솔에 상세 정보 출력
      if (data) {
        console.log(`[DEBUG] ${context || 'App'}:`, data);
      }
    }
  }

  log(message: string, context?: string, data?: any) {
    if (this.shouldLog('log')) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'LOG',
        context: context || 'App',
        message,
        data,
      };
      this.addToBuffer(entry);
      this.logger.log(message, context);
    }
  }

  warn(message: string, context?: string, data?: any) {
    if (this.shouldLog('warn')) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'WARN',
        context: context || 'App',
        message,
        data,
      };
      this.addToBuffer(entry);
      this.logger.warn(message, context);
    }
  }

  error(message: string, trace?: string, context?: string, data?: any) {
    if (this.shouldLog('error')) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        context: context || 'App',
        message,
        data,
      };
      this.addToBuffer(entry);
      this.logger.error(message, trace, context);
    }
  }

  // Audit logging
  audit(action: string, resource: string, result: string, metadata?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'AUDIT',
      context: 'Audit',
      message: `${action} | ${resource} | ${result}`,
      data: metadata,
    };
    this.addToBuffer(entry);
    this.auditLogger.log(`[AUDIT] ${action} | ${resource} | ${result}`);
  }

  // Get recent logs for debugging
  getRecentLogs(count = 100, level?: string): LogEntry[] {
    let filtered = this.logs;
    if (level) {
      filtered = this.logs.filter(l => l.level === level.toUpperCase());
    }
    return filtered.slice(-count);
  }

  // Export logs to file
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }
}
