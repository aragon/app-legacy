import * as Sentry from '@sentry/react';

class Monitoring {
  public enableMonitoring = async (enable?: boolean) => {
    const serviceDisabled =
      import.meta.env.VITE_FEATURE_FLAG_MONITORING === 'false';

    if (!enable || serviceDisabled) {
      return;
    }

    this.initSentry();
  };

  private initSentry = () => {
    const sentryKey = import.meta.env.VITE_SENTRY_DNS;

    if (sentryKey && sentryKey.length > 0) {
      Sentry.init({
        dsn: sentryKey,
        release: import.meta.env.VITE_REACT_APP_DEPLOY_VERSION ?? '0.1.0',
        environment:
          import.meta.env.VITE_REACT_APP_DEPLOY_ENVIRONMENT ?? 'local',
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
  };
}

export const monitoring = new Monitoring();
