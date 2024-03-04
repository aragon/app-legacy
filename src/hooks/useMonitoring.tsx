import {usePrivacyContext} from 'context/privacyContext';
import {useEffect} from 'react';
import {monitoring} from 'services/monitoring';
import {logger} from 'services/logger';

export const useMonitoring = () => {
  const {preferences} = usePrivacyContext();

  useEffect(() => {
    const enableMonitoring = async () => {
      await monitoring.enableMonitoring(preferences?.analytics);
    };
    enableMonitoring().catch((error: Error) => {
      logger.error('Error enabling monitoring', {error});
    });
  }, [preferences?.analytics]);
};
