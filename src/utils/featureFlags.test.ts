import {FeatureFlags} from './featureFlags';

describe('featureFlags utils', () => {
  const setItemMock = jest.spyOn(
    Object.getPrototypeOf(sessionStorage),
    'setItem'
  );

  const getItemMock = jest.spyOn(
    Object.getPrototypeOf(sessionStorage),
    'getItem'
  );

  const originalLocation = {...window.location};
  const originalEnv = {...process.env};
  let featureFlagsService = new FeatureFlags();

  afterEach(() => {
    window.location = originalLocation;
    process.env = originalEnv;
    featureFlagsService = new FeatureFlags();

    setItemMock.mockReset();
    getItemMock.mockReset();
  });

  describe('initializeFeatureFlags', () => {
    it('initializes the session-storage with the feature flags defined on the url', () => {
      const featureFlag1 = {key: 'VITE_FEATURE_FLAG_1', value: 'true'};
      const featureFlag2 = {key: 'VITE_FEATURE_FLAG_2', value: 'false'};
      const locationSearch = `?${featureFlag1.key}=${featureFlag1.value}&${featureFlag2.key}=${featureFlag2.value}`;

      // @ts-expect-error location is not optional
      delete window.location;
      window.location = {search: locationSearch} as Location;
      featureFlagsService.initializeFeatureFlags();

      expect(setItemMock).toHaveBeenNthCalledWith(
        1,
        featureFlag1.key,
        featureFlag1.value
      );

      expect(setItemMock).toHaveBeenNthCalledWith(
        2,
        featureFlag2.key,
        featureFlag2.value
      );
    });

    it('does not store query parameters not matching the feature-flag prefix', () => {
      const queryParam1 = {key: 'testKey', value: 'testValue'};
      const queryParam2 = {key: 'VITE_FEATURE_FLAG_TEST', value: 'test'};
      const locationSearch = `?${queryParam1.key}=${queryParam1.value}&${queryParam2.key}=${queryParam2.value}`;

      // @ts-expect-error location is not optional
      delete window.location;
      window.location = {search: locationSearch} as Location;
      featureFlagsService.initializeFeatureFlags();

      expect(setItemMock).toHaveBeenNthCalledWith(
        1,
        queryParam2.key,
        queryParam2.value
      );
    });
  });

  describe('getValue', () => {
    it('initializes the storage when the service has not been initialized yet', () => {
      const initializeSpy = jest.spyOn(
        featureFlagsService,
        'initializeFeatureFlags'
      );
      featureFlagsService.getValue('VITE_FEATURE_FLAG_TEST');
      expect(initializeSpy).toHaveBeenCalled();
    });

    it('returns the value set on the session-storage', () => {
      const flagKey = 'VITE_FEATURE_FLAG_TEST';
      const sessionValue = 'true';
      const envValue = 'false';

      getItemMock.mockReturnValue(sessionValue);
      process.env[flagKey] = envValue;
      expect(featureFlagsService.getValue(flagKey)).toEqual(sessionValue);
    });

    it('returns the value set on the environment when no value is set on the session-storage', () => {
      const flagKey = 'VITE_FEATURE_FLAG_TEST';
      const envValue = 'false';

      process.env[flagKey] = envValue;
      expect(featureFlagsService.getValue(flagKey)).toEqual(envValue);
    });
  });
});
