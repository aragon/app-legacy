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
        <div className="fixed bottom-4 w-full">
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
    'flex xl:mx-10 2xl:w-[1520px] 2xl:mx-auto items-center p-6 space-x-6 bg-neutral-0 rounded-xl border border-neutral-100',
})`
  box-shadow:
    0px 16px 24px rgba(31, 41, 51, 0.06),
    0px 2px 6px rgba(31, 41, 51, 0.04),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const MobileModal = styled.div.attrs({
  className: `space-y-6 fixed bottom-4 z-50 p-4 mx-4 rounded-xl border border-neutral-100 bg-neutral-0
    md:w-[448px] md:bottom-6 md:left-1/2 md:mx-0 md:-translate-x-1/2`,
})`
  box-shadow:
    0px 24px 32px rgba(31, 41, 51, 0.04),
    0px 16px 24px rgba(31, 41, 51, 0.04),
    0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;
