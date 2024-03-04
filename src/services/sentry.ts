import * as Sentry from '@sentry/react';
import {SeverityLevel} from '@sentry/types/types/severity';
import {LogLevel} from './logger';

export function initSentry() {
  const sentryKey = import.meta.env.VITE_SENTRY_DNS;

  if (sentryKey && sentryKey.length > 0) {
    Sentry.init({
      dsn: sentryKey,
      release: import.meta.env.VITE_REACT_APP_DEPLOY_VERSION ?? '0.1.0',
      environment: import.meta.env.VITE_REACT_APP_DEPLOY_ENVIRONMENT ?? 'local',
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true, // Masks all text to protect user privacy
          blockAllMedia: true, // Blocks all media to ensure privacy
        }),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
}

export const sendToSentry = ({
  level,
  msg,
  obj,
}: {
  level: LogLevel;
  msg: string;
  obj?: Record<string, unknown>;
}) => {
  const client = Sentry.getClient();
  if (!client) {
    console.log(msg, obj);
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

function mapLogLevelToSentrySeverity(level: LogLevel): SeverityLevel {
  if (level === LogLevel.warn) {
    return 'warning';
  }
  return level;
}
