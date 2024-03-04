import {sendToSentry} from './sentry';

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
  sendToSentry({level, msg, obj});
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
