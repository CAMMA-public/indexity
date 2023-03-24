import { Logger } from '@nestjs/common';
import { LogLevel } from '../enums/log-level.enum';

export class LeveledLogger extends Logger {
  private static logLevel: LogLevel = LogLevel.VERBOSE;

  static set level(level: LogLevel) {
    Logger.log(
      `Log level set to ${LeveledLogger.getLevelString(level)}`,
      'LeveledLogger',
    );
    LeveledLogger.logLevel = level;
  }

  static get level(): LogLevel {
    return LeveledLogger.logLevel;
  }

  static getLevelString(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR:
        return 'ERROR';
      case LogLevel.WARN:
        return 'WARN';
      case LogLevel.LOG:
        return 'LOG';
      case LogLevel.DEBUG:
        return 'DEBUG';
      case LogLevel.VERBOSE:
        return 'VERBOSE';
    }
  }

  error(message: any, trace?: string, context?: string): void {
    if (LeveledLogger.logLevel >= LogLevel.ERROR) {
      super.error(message, trace, context);
    }
  }

  warn(message: any, context?: string): void {
    if (LeveledLogger.logLevel >= LogLevel.WARN) {
      super.warn(message, context);
    }
  }

  log(message: any, context?: string): void {
    if (LeveledLogger.logLevel >= LogLevel.LOG) {
      super.log(message, context);
    }
  }

  debug(message: any, context?: string): void {
    if (LeveledLogger.logLevel >= LogLevel.DEBUG) {
      super.debug(message, context);
    }
  }

  verbose(message: any, context?: string): void {
    if (LeveledLogger.logLevel >= LogLevel.VERBOSE) {
      super.verbose(message, context);
    }
  }
}
