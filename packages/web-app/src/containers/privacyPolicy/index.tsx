import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import React, {useState} from 'react';

import useScreen from 'hooks/useScreen';
import BottomSheet from 'components/bottomSheet';
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
  const {t} = useTranslation();
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
        // TODO: make sure bottom sheet cannot close until user accepts one of the options
        <BottomSheet
          title={t('privacyPolicy.title')}
          isOpen={showPolicy}
          onClose={() => null}
          closeOnDrag={false}
        >
          <BottomSheetContentContainer>
            <PrivacyPolicyContent
              isDesktop={false}
              onAcceptAll={onAcceptAll}
              onRejectAll={onRejectAll}
              onShowCookieSettings={() => setShowCookieSettings(true)}
            />
          </BottomSheetContentContainer>
        </BottomSheet>
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

const BottomSheetContentContainer = styled.div.attrs({
  className: 'py-3 px-2 space-y-3 tablet:w-56',
})``;
