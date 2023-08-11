import {init as initApm, ApmBase, AgentConfigOptions} from '@elastic/apm-rum';

class Monitoring {
  options: AgentConfigOptions;
  apm?: ApmBase;

  constructor() {
    const version = import.meta.env.VITE_REACT_APP_DEPLOY_VERSION ?? '0.1.0';
    const env = import.meta.env.VITE_REACT_APP_DEPLOY_ENVIRONMENT ?? 'local';

    this.options = {
      serviceName: 'aragon-app',
      serverUrl: 'https://apm-monitoring.aragon.org',
      serviceVersion: version,
      environment: env,
    };
  }

  enableMonitoring = (enable?: boolean) => {
    const serviceDisabled =
      import.meta.env.VITE_FEATURE_FLAG_MONITORING === 'false';

    if (!enable || this.apm != null || serviceDisabled) {
      return;
    }

    this.apm = initApm(this.options);
  };
}

export const monitoring = new Monitoring();
