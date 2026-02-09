import { Controller, Get, Query, Logger } from '@nestjs/common';
import { AppLogger } from '../common/logger.service';

@Controller('debug')
export class DebugController {
  private readonly logger = new Logger(DebugController.name);

  constructor(private readonly appLogger: AppLogger) {}

  @Get('logs')
  getLogs(
    @Query('count') count?: string,
    @Query('level') level?: string,
  ) {
    const numCount = count ? parseInt(count, 10) : 100;
    const logs = this.appLogger.getRecentLogs(numCount, level);
    
    this.logger.debug(`Fetching ${numCount} logs${level ? ` with level ${level}` : ''}`);
    
    return {
      total: logs.length,
      logs,
    };
  }

  @Get('logs/export')
  exportLogs() {
    const data = this.appLogger.exportLogs();
    
    return {
      data,
      filename: `logs-${new Date().toISOString()}.json`,
    };
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
    };
  }

  @Get('test-log')
  testLog() {
    this.logger.verbose('Verbose level log', 'DebugController');
    this.logger.debug('Debug level log', 'DebugController');
    this.logger.log('Log level message', 'DebugController');
    this.logger.warn('Warning level log', 'DebugController');
    this.logger.error('Error level log', undefined, 'DebugController');

    return {
      message: 'Test logs generated. Check console output.',
      levels: ['verbose', 'debug', 'log', 'warn', 'error'],
    };
  }
}
