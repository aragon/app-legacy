import {logger} from './logger';

class Monitoring {
  enableMonitoring = async (enable?: boolean) => {
    const serviceDisabled =
      import.meta.env.VITE_FEATURE_FLAG_MONITORING === 'false';

    if (!enable || serviceDisabled) {
      return;
    }

    const {initSentry} = await import('services/sentry');
    initSentry();
  };
}

export const monitoring = new Monitoring();
