import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {Nullable} from 'utils/types';
import PrivacyPolicy from 'containers/privacyPolicy';
import CookiePreferenceMenu from 'containers/privacyPolicy/cookiePreferenceMenu';
import {disableAnalytics, enableAnalytics} from 'services/analytics';
import CookieSettingsMenu from 'containers/privacyPolicy/cookieSettingsMenu';

export type PrivacyPreferences = {
  analytics: boolean;
  functional: boolean;
};

type PrivacyContextType = {
  preferences?: Nullable<PrivacyPreferences>;
  policyAccepted: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  setPrivacyPolicy: (preferences: PrivacyPreferences) => void;
  setAnalyticsCookies: () => void;
  setFunctionalCookies: () => void;
  handleWithFunctionalPreferenceMenu: (
    onAccept: () => void,
    onReject?: () => void
  ) => void;
};

const PrivacyContext = createContext<PrivacyContextType | null>(null);

const PRIVACY_KEY = 'privacy-policy-preferences';

const PrivacyContextProvider: React.FC<{children: ReactNode}> = ({
  children,
}) => {
  // 'cache' for the privacy preferences to reduce storage usage and increase speed
  const [preferences, setPreferences] = useState<PrivacyPreferences>();

  // privacy policy has been accepted when this is false
  const [showPolicyMenu, setShowPolicyMenu] = useState<boolean>(true);
  const [showCookieSettings, setShowCookieSettings] = useState<boolean>(false);

  // cookie preference menu state
  const [showPreferenceMenu, setShowPreferenceMenu] = useState<boolean>(false);
  const [preferenceMenuCallbacks, setPreferenceMenuCallbacks] = useState({
    onAccept: () => setShowPreferenceMenu(true),
    onReject: () => setShowPreferenceMenu(false),
  });

  /*************************************************
   *                    Hooks                      *
   *************************************************/
  useEffect(() => {
    // get preferences from storage
    const value = localStorage.getItem(PRIVACY_KEY);

    // show menu if no policy has been accepted
    if (!value) return;

    // set state
    const storedPreferences = JSON.parse(value);
    setShowPolicyMenu(false);
    setPreferences(storedPreferences);

    // enable analytics
    if (storedPreferences.analytics) enableAnalytics();
  }, []);

  /*************************************************
   *              Methods and handlers             *
   *************************************************/
  // Set the privacy preferences in local storage and update context state
  const setPrivacyPolicy = useCallback(
    (userPreference: PrivacyPreferences) => {
      if (userPreference.analytics || userPreference.functional) {
        localStorage.setItem(
          PRIVACY_KEY,
          JSON.stringify({optIn: true, ...userPreference})
        );

        // enable analytics if was previously off
        if (!preferences?.analytics && userPreference.analytics)
          enableAnalytics();

        // turn off analytics if was previously on
        if (preferences?.analytics && !userPreference.analytics)
          disableAnalytics();

        setPreferences({...userPreference});
      } else {
        localStorage.setItem(PRIVACY_KEY, JSON.stringify({optIn: false}));
      }

      setShowPolicyMenu(false);
      setShowCookieSettings(false);
    },
    [preferences?.analytics]
  );

  // accept all cookies
  const acceptAll = useCallback(() => {
    setPrivacyPolicy({analytics: true, functional: true});
  }, [setPrivacyPolicy]);

  // reject all cookies
  const rejectAll = useCallback(() => {
    setPrivacyPolicy({analytics: false, functional: false});
    disableAnalytics();
  }, [setPrivacyPolicy]);

  // set only functional cookies
  const setFunctionalCookies = useCallback(() => {
    setPrivacyPolicy({
      analytics: preferences?.analytics || false,
      functional: true,
    });
  }, [preferences?.analytics, setPrivacyPolicy]);

  // set only analytics cookies
  const setAnalyticsCookies = useCallback(() => {
    setPrivacyPolicy({
      analytics: true,
      functional: preferences?.functional || false,
    });
  }, [preferences?.functional, setPrivacyPolicy]);

  const handleShowCookiesSettings = useCallback(() => {
    setShowCookieSettings(true);
    setShowPolicyMenu(false);
  }, []);

  const handleCloseCookiesSettings = useCallback(() => {
    setShowCookieSettings(false);
    setShowPolicyMenu(true);
  }, []);

  /**
   * Handle the cookie preference menu
   *
   * @param onAccept callback to be called when the user accepts the cookies
   * @param onReject callback to be called when the user rejects the cookies or closes the menu
   */
  const handleWithFunctionalPreferenceMenu = useCallback(
    (onAccept: () => void, onReject?: () => void) => {
      if (preferences?.functional) {
        onAccept();
        return;
      }

      setShowPreferenceMenu(true);
      setPreferenceMenuCallbacks({
        onAccept: () => {
          setFunctionalCookies();
          setShowPreferenceMenu(false);
          onAccept();
        },
        onReject: () => {
          setShowPreferenceMenu(false);
          onReject?.();
        },
      });
    },
    [preferences?.functional, setFunctionalCookies]
  );

  const value = useMemo(
    () => ({
      preferences,
      // policy has been accepted if the menu is not shown
      policyAccepted: !showPolicyMenu,
      acceptAll,
      rejectAll,
      setPrivacyPolicy,
      setAnalyticsCookies,
      setFunctionalCookies,
      handleWithFunctionalPreferenceMenu,
    }),
    [
      acceptAll,
      handleWithFunctionalPreferenceMenu,
      showPolicyMenu,
      preferences,
      rejectAll,
      setAnalyticsCookies,
      setFunctionalCookies,
      setPrivacyPolicy,
    ]
  );

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <PrivacyContext.Provider value={value}>
      {children}
      <PrivacyPolicy
        showPolicy={showPolicyMenu}
        onAcceptAll={acceptAll}
        onRejectAll={rejectAll}
        onShowCookieSettings={handleShowCookiesSettings}
      />
      <CookiePreferenceMenu
        show={showPreferenceMenu}
        onClose={preferenceMenuCallbacks.onReject}
        onAccept={preferenceMenuCallbacks.onAccept}
      />
      <CookieSettingsMenu
        show={showCookieSettings}
        onClose={handleCloseCookiesSettings}
        onAcceptClick={setPrivacyPolicy}
        onRejectAllClick={rejectAll}
      />
    </PrivacyContext.Provider>
  );
};

function usePrivacyContext(): PrivacyContextType {
  return useContext(PrivacyContext) as PrivacyContextType;
}

export {PrivacyContextProvider, usePrivacyContext};
