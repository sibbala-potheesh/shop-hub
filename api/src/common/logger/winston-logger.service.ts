import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
const DailyRotateFile = require('winston-daily-rotate-file');

// ---- Custom Levels & Colors ----
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'cyan',
  debug: 'blue',
  silly: 'grey',
};

winston.addColors(logColors);

// ---- Formats ----
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    ({ timestamp, level, message, context, trace, ...meta }) => {
      let output = `${timestamp} [${level}]`;
      if (context) output += ` [${context}]`;
      output += ` ${message}`;

      if (Object.keys(meta).length) {
        output += ` ${JSON.stringify(meta)}`;
      }

      if (trace) {
        output += `\n${trace}`;
      }

      return output;
    },
  ),
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

@Injectable()
export class WinstonLogger implements LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    const environment = process.env.NODE_ENV || 'development';
    const consoleLevel = environment === 'production' ? 'info' : 'debug';

    // ---- Transports ----
    const transports: winston.transport[] = [
      new winston.transports.Console({
        level: consoleLevel,
        format: consoleFormat,
      }),

      new DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: fileFormat,
        level: 'info',
      }),

      new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        format: fileFormat,
        level: 'error',
      }),
    ];

    // ---- Logger Instance ----
    this.logger = winston.createLogger({
      levels: logLevels,
      format: fileFormat,
      transports,
      exitOnError: false,
    });
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }

  http(message: any, context?: string) {
    this.logger.http(message, { context });
  }
}

// ---- Export standalone logger for non-Nest usage ----
export const logger = winston.createLogger({
  levels: logLevels,
  format: fileFormat,
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
      level: 'info',
    }),
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
      level: 'error',
    }),
  ],
});

// ---- Morgan stream support ----
export const stream = {
  write: (msg: string) => logger.http(msg.trim()),
};
