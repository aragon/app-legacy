/**
 * Utility class to retrieve the feature flags set for the current environment.
 */
class FeatureFlags {
  private featureFlagPrefix = 'VITE_FEATURE_FLAG';
  private isInitialized = false;

  /**
   * The function initializes the session storage with the feature flags set on the current URL. The feature
   * flags can be retrieved later on using the "getValue" function.
   */
  initializeFeatureFlags = () => {
    const queryParams = [
      ...new URLSearchParams(window.location.search).entries(),
    ];

    queryParams.forEach(([queryKey, queryValue]) => {
      if (queryKey.startsWith(this.featureFlagPrefix)) {
        sessionStorage.setItem(queryKey, queryValue);
      }
    });

    this.isInitialized = true;
  };

  /**
   * The function checks if a feature flag has been set for the current session and returns it, otherwise it
   * defaults to the value set on the .env.[environment] file for the current environment.
   * @param featureFlag The feature flag to retrieve.
   * @returns The value of the feature flag when set, undefined otherwise.
   */
  getValue = (featureFlag: string): string | undefined => {
    if (!this.isInitialized) {
      this.initializeFeatureFlags();
    }

    const sessionValue = sessionStorage.getItem(featureFlag);
    const envValue = import.meta.env[featureFlag];

    return sessionValue ?? envValue;
  };
}

export const featureFlags = new FeatureFlags();
