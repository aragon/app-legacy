import {initSentry} from 'services/sentry';

class Monitoring {
  enableMonitoring = async (enable?: boolean) => {
    const serviceDisabled =
      import.meta.env.VITE_FEATURE_FLAG_MONITORING === 'false';

    if (!enable || serviceDisabled) {
      return;
    }

    initSentry();
  };
}

export const monitoring = new Monitoring();
