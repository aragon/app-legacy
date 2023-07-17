import {featureFlags} from './featureFlags';

describe('featureFlags utils', () => {
  const setItemMock = jest.spyOn(
    Object.getPrototypeOf(sessionStorage),
    'setItem'
  );

  const originalLocation = {...window.location};

  afterEach(() => {
    window.location = originalLocation;
  });

  describe('initializeFeatureFlags', () => {
    it('initializes the session-storage with the feature flags defined on the url', () => {
      const featureFlag1 = {key: 'VITE_FEATURE_FLAG_1', value: 'true'};
      const featureFlag2 = {key: 'VITE_FEATURE_FLAG_2', value: 'false'};
      const locationSearch = `?${featureFlag1.key}=${featureFlag1.value}&${featureFlag2.key}=${featureFlag2.value}`;

      delete window.location;
      window.location = {search: locationSearch} as Location;
      featureFlags.initializeFeatureFlags();

      expect(setItemMock).toHaveBeenNthCalledWith(
        1,
        featureFlag1.key,
        featureFlag1.value
      );
    });

    it('does not store query parameters not matching the feature-flag prefix', () => {
      //
    });
  });
});
