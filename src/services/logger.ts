import * as Sentry from '@sentry/react';
import {SeverityLevel} from '@sentry/types/types/severity';

export enum LogLevel {
  debug = 'debug',
  info = 'info',
  warn = 'warn',
  error = 'error',
}

const logWithLevel = (
  level: LogLevel,
  msg: string,
  obj: Record<string, unknown> = {}
) => {
  const client = Sentry.getClient();
  if (!client) {
    return;
  }

  const sentryLevel = mapLogLevelToSentrySeverity(level);

  if (sentryLevel === LogLevel.error) {
    Sentry.captureException(new Error(msg), {extra: obj});
  } else {
    Sentry.captureEvent({
      message: msg,
      level: sentryLevel,
      extra: obj,
    });
  }
};

export const mapLogLevelToSentrySeverity = (level: LogLevel): SeverityLevel => {
  if (level === LogLevel.warn) {
    return 'warning';
  }
  return level;
};

export const logger = {
  debug: (msg: string, obj: Record<string, unknown> = {}) =>
    logWithLevel(LogLevel.debug, msg, obj),
  info: (msg: string, obj: Record<string, unknown> = {}) =>
    logWithLevel(LogLevel.info, msg, obj),
  warn: (msg: string, obj: Record<string, unknown> = {}) =>
    logWithLevel(LogLevel.warn, msg, obj),
  error: (msg: string, obj: Record<string, unknown> = {}) =>
    logWithLevel(LogLevel.error, msg, obj),
};
