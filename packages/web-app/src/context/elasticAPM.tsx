import {init as initApm, ApmBase} from '@elastic/apm-rum';
import React, {useState, useMemo, useContext} from 'react';

import {usePrivacyContext} from './privacyContext';

interface IAPMContext {
  apm: ApmBase | null;
  setApm: React.Dispatch<React.SetStateAction<ApmBase | null>> | null;
}
const UseAPMContext = React.createContext<IAPMContext>({
  apm: null,
  setApm: null,
});

const APMProvider: React.FC = ({children}) => {
  const {preferences} = usePrivacyContext();
  const [apm, setApm] = useState<ApmBase | null>(() =>
    initializeAPM(preferences?.analytics)
  );

  const contextValue = useMemo(() => {
    return {apm, setApm};
  }, [apm, setApm]);

  return (
    <UseAPMContext.Provider value={contextValue}>
      {children}
    </UseAPMContext.Provider>
  );
};

const useAPM = () => {
  return useContext(UseAPMContext);
};

const updateAPMContext = (apm: ApmBase | null, networkType: string | null) => {
  if (apm && networkType) {
    const context = {networkType: networkType};
    apm.addLabels(context);
    apm.setCustomContext(context);
  }
};

function initializeAPM(setAnalytics: boolean | undefined) {
  // opt out of analytics based on user preferences
  if (!setAnalytics) return null;

  // check for proper environment variables
  if (
    import.meta.env.VITE_REACT_APP_DEPLOY_VERSION &&
    import.meta.env.VITE_REACT_APP_DEPLOY_ENVIRONMENT
  ) {
    return initApm({
      //serviceName: 'zaragoza',
      serviceName: 'aragon-app',
      serverUrl: 'https://apm-monitoring.aragon.org',
      serviceVersion: import.meta.env.VITE_REACT_APP_DEPLOY_VERSION as string,
      environment: import.meta.env.VITE_REACT_APP_DEPLOY_ENVIRONMENT as string,
    });
  } else {
    console.warn(
      'REACT_APP_DEPLOY_VERSION or REACT_APP_DEPLOY_ENVIRONMENT is not provided.'
    );
    return null;
  }
}

export {APMProvider, useAPM, updateAPMContext};
