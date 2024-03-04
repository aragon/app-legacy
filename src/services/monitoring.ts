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
    logger.info('sentry loaded info1', {test: 1});
    logger.warn('sentry loaded warn1', {test: 2});
    // logger.error('sentry loaded error');
    logger.debug('sentry loaded debug1');
  };
}

export const monitoring = new Monitoring();
