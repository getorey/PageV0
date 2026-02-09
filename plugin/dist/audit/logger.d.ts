export interface AuditLogEntry {
    id: string;
    timestamp: Date;
    event: string;
    user?: string;
    details: Record<string, any>;
}
export declare class AuditLogger {
    private logs;
    logToolAttempt(tool: string, params: any): Promise<void>;
    logToolResult(tool: string, params: any, result: any): Promise<void>;
    logFileOperation(operation: string, path: string, risks: Risk[]): Promise<void>;
    logSessionStart(): Promise<void>;
    logSessionEnd(): Promise<void>;
    getLogs(event?: string): Promise<AuditLogEntry[]>;
    private log;
    private maskSensitive;
    private truncateResult;
}
interface Risk {
    level: string;
    description: string;
}
export {};
//# sourceMappingURL=logger.d.ts.map