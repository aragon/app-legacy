export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface ILoggerErrorContext {
  /**
   * Stack of the log (e.g. [CREATE_DAO, PIN_METADATA])
   */
  stack: string[];
  /**
   * Current step where the application failed (e.g. [ADD_DATA]).
   */
  step: string;
  /**
   * Extra data to log.
   */
  data?: Record<string, unknown>;
}

export type ILoggerErrorParams = [unknown, ILoggerErrorContext];
export type ILoggerParams = [string, Record<string, unknown>];

class Logger {
  debug = (...params: ILoggerParams) =>
    this.logMessage(LogLevel.DEBUG, ...params);

  info = (...params: ILoggerParams) =>
    this.logMessage(LogLevel.INFO, ...params);

  warn = (...params: ILoggerParams) =>
    this.logMessage(LogLevel.WARN, ...params);

  error = (...params: ILoggerErrorParams) =>
    this.logMessage(LogLevel.ERROR, params[0], {...params[1]});

  private logMessage = (
    level: LogLevel,
    message?: string | unknown,
    object?: Record<string, unknown>
  ) => {
    const isDev = import.meta.env.DEV;

    if (isDev) {
      console.log({level, message, object});
    }
  };
}

export const logger = new Logger();
