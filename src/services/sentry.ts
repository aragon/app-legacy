import * as Sentry from '@sentry/react';

const sentryKey = import.meta.env.VITE_SENTRY_DNS;

if (sentryKey && sentryKey.length > 0) {
  Sentry.init({
    dsn: sentryKey,
    release: import.meta.env.VITE_REACT_APP_DEPLOY_VERSION,
    environment: import.meta.env.VITE_REACT_APP_DEPLOY_ENVIRONMENT || 'local',
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
