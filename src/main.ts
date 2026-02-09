import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger, LogLevel } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const logLevels: LogLevel[] = process.env.LOG_LEVEL === 'debug' 
    ? ['verbose', 'debug', 'log', 'warn', 'error']
    : ['log', 'warn', 'error'];

  const app = await NestFactory.create(AppModule, {
    logger: logLevels,
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`🚀 AI Work Automation Agent is running on: http://localhost:${port}`);
  logger.log(`📊 Debug endpoints available at: http://localhost:${port}/debug`);
  logger.log(`   - GET /debug/logs - View recent logs`);
  logger.log(`   - GET /debug/health - Health check`);
  logger.log(`   - GET /debug/test-log - Generate test logs`);

  if (process.env.LOG_LEVEL === 'debug') {
    logger.debug('Debug mode enabled - verbose logging active');
  }
}
bootstrap();
