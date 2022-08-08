import styled from 'styled-components';
import React, {useState} from 'react';

import useScreen from 'hooks/useScreen';
import CookieSettingsMenu from './cookieSettingsMenu';
import PrivacyPolicyContent from './privacyPolicyContent';
import {PrivacyPreferences} from 'context/privacyContext';

type PrivacyPolicyProps = {
  showPolicy: boolean;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onAcceptPolicy: (preferences: PrivacyPreferences) => void;
};

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({
  showPolicy,
  onAcceptAll,
  onRejectAll,
  onAcceptPolicy,
}) => {
  const {isDesktop} = useScreen();
  const [showCookieSettings, setShowCookieSettings] = useState<boolean>(false);

  if (!showPolicy) return null;

  return (
    <>
      {isDesktop ? (
        <div className="fixed bottom-5 w-full">
          <Container>
            <PrivacyPolicyContent
              isDesktop={true}
              onAcceptAll={onAcceptAll}
              onRejectAll={onRejectAll}
              onShowCookieSettings={() => setShowCookieSettings(true)}
            />
          </Container>
        </div>
      ) : (
        <MobileModal>
          <PrivacyPolicyContent
            isDesktop={false}
            onAcceptAll={onAcceptAll}
            onRejectAll={onRejectAll}
            onShowCookieSettings={() => setShowCookieSettings(true)}
          />
        </MobileModal>
      )}
      <CookieSettingsMenu
        show={showCookieSettings}
        onClose={() => setShowCookieSettings(false)}
        onAcceptClick={onAcceptPolicy}
        onRejectAllClick={onRejectAll}
      />
    </>
  );
};

export default PrivacyPolicy;

const Container = styled.div.attrs({
  className:
    'flex desktop:mx-5 wide:w-190 wide:mx-auto items-center p-3 space-x-3 bg-ui-0 rounded-xl border border-ui-100',
})`
  box-shadow: 0px 16px 24px rgba(31, 41, 51, 0.06),
    0px 2px 6px rgba(31, 41, 51, 0.04), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const MobileModal = styled.div.attrs({
  className:
    'space-y-3 tablet:w-56 fixed bottom-2 tablet:left-1/2 z-50 p-2 mx-2 bg-ui-0 rounded-xl border border-ui-100 tablet:transform tablet:-translate-x-1/2',
})`
  box-shadow: 0px 24px 32px rgba(31, 41, 51, 0.04),
    0px 16px 24px rgba(31, 41, 51, 0.04), 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;
