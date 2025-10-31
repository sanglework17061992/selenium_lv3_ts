import * as winston from 'winston';
import { ConfigManager } from '@config/ConfigManager';

/**
 * Logger - Singleton Pattern
 * Centralized logging for the framework
 */
export class Logger {
  private static instance: Logger;
  private logger: winston.Logger;

  private constructor() {
    const config = ConfigManager.getInstance().getReportingConfig();
    
    this.logger = winston.createLogger({
      level: config.logLevel,
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'selenium-framework' },
      transports: [
        // Write all logs with importance level of `error` or less to `error.log`
        new winston.transports.File({ 
          filename: 'reports/error.log', 
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        }),
        // Write all logs with importance level of `info` or less to `combined.log`
        new winston.transports.File({ 
          filename: 'reports/combined.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        }),
      ],
    });

    // If we're not in production then log to the `console` with the format:
    // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
          })
        )
      }));
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  public error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  public verbose(message: string, meta?: any): void {
    this.logger.verbose(message, meta);
  }
}