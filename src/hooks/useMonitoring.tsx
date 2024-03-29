import {usePrivacyContext} from 'context/privacyContext';
import {useEffect} from 'react';
import {monitoring} from 'services/monitoring';

export const useMonitoring = () => {
  const {preferences} = usePrivacyContext();

  useEffect(() => {
    monitoring.enableMonitoring(preferences?.analytics);
  }, [preferences?.analytics]);
};
