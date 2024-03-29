import {
  BrowserOptions,
  browserTracingIntegration,
  init,
  replayIntegration,
  SeverityLevel,
  captureException,
  captureEvent,
} from '@sentry/react';

export type MonitoringLevel = SeverityLevel;

export interface ICaptureMessageParams {
  level: MonitoringLevel;
  message?: string;
  error?: unknown;
  context?: Record<string, unknown>;
}

class Monitoring {
  private monitoringKey = import.meta.env.VITE_SENTRY_DNS;

  private isEnabled = false;

  private monitoringOptions: BrowserOptions = {
    dsn: this.monitoringKey,
    release: import.meta.env.VITE_REACT_APP_DEPLOY_VERSION ?? '0.1.0',
    environment: import.meta.env.VITE_REACT_APP_DEPLOY_ENVIRONMENT ?? 'local',
    integrations: [
      browserTracingIntegration(),
      replayIntegration({
        maskAllText: true, // Masks all text to protect user privacy
        blockAllMedia: true, // Blocks all media to ensure privacy
      }),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  };

  captureMessage = (params: ICaptureMessageParams) => {
    if (!this.isEnabled) {
      return;
    }

    const {level, message, error, context} = params;

    if (level === 'error') {
      captureException(error, {extra: context});
    } else {
      captureEvent({message, level, extra: context});
    }
  };

  enableMonitoring = (enable?: boolean) => {
    const serviceDisabled =
      import.meta.env.VITE_FEATURE_FLAG_MONITORING === 'false';

    if (!enable || serviceDisabled) {
      return;
    }

    this.initMonitoring();
  };

  private initMonitoring = () => {
    if (this.monitoringKey == null || this.monitoringKey.length === 0) {
      return;
    }

    init(this.monitoringOptions);
    this.isEnabled = true;
  };
}

export const monitoring = new Monitoring();
