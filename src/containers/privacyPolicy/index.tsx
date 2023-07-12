import styled from 'styled-components';
import React from 'react';

import useScreen from 'hooks/useScreen';
import PrivacyPolicyContent from './privacyPolicyContent';

type PrivacyPolicyProps = {
  showPolicy: boolean;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onShowCookieSettings: () => void;
};

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({
  showPolicy,
  onAcceptAll,
  onRejectAll,
  onShowCookieSettings,
}) => {
  const {isDesktop} = useScreen();

  if (!showPolicy) return null;

  return (
    <>
      {isDesktop ? (
        <div className="fixed bottom-2 w-full">
          <Container>
            <PrivacyPolicyContent
              isDesktop={true}
              onAcceptAll={onAcceptAll}
              onRejectAll={onRejectAll}
              onShowCookieSettings={onShowCookieSettings}
            />
          </Container>
        </div>
      ) : (
        <MobileModal>
          <PrivacyPolicyContent
            isDesktop={false}
            onAcceptAll={onAcceptAll}
            onRejectAll={onRejectAll}
            onShowCookieSettings={onShowCookieSettings}
          />
        </MobileModal>
      )}
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
  className: `space-y-3 fixed bottom-2 z-50 p-2 mx-2 rounded-xl border border-ui-100 bg-ui-0
    tablet:w-56 tablet:bottom-3 tablet:left-1/2 tablet:mx-0 tablet:transform tablet:-translate-x-1/2`,
})`
  box-shadow: 0px 24px 32px rgba(31, 41, 51, 0.04),
    0px 16px 24px rgba(31, 41, 51, 0.04), 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;
