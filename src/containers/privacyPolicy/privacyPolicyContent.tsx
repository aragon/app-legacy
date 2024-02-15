import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {htmlIn} from 'utils/htmlIn';
import {Button} from '@aragon/ods';

type PrivacyPolicyContentProps = {
  isDesktop: boolean;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onShowCookieSettings: () => void;
};

const PrivacyPolicyContent: React.FC<PrivacyPolicyContentProps> = ({
  isDesktop,
  ...props
}) => {
  const {t} = useTranslation();

  return (
    <>
      <Text
        dangerouslySetInnerHTML={{
          __html: htmlIn(t)('privacyPolicy.content'),
        }}
      />

      <ButtonGroup>
        <Button
          variant="tertiary"
          {...(isDesktop ? {size: 'md'} : {size: 'lg', className: 'w-full'})}
          onClick={props.onAcceptAll}
        >
          {t('privacyPolicy.acceptAllCookies')}
        </Button>
        <Button
          variant="tertiary"
          {...(isDesktop ? {size: 'sm'} : {size: 'lg', className: 'w-full'})}
          onClick={props.onRejectAll}
        >
          {t('privacyPolicy.rejectAllCookies')}
        </Button>
        <Button
          {...(isDesktop
            ? {variant: 'secondary', size: 'sm'}
            : {
                variant: 'tertiary',
                size: 'lg',
                className: 'w-full',
              })}
          onClick={props.onShowCookieSettings}
        >
          {t('privacyPolicy.cookieSettings')}
        </Button>
      </ButtonGroup>
    </>
  );
};

export default PrivacyPolicyContent;

const Text = styled.div.attrs({
  className: 'flex-1 ft-text-sm text-neutral-600',
})``;

const ButtonGroup = styled.div.attrs({
  className:
    'space-y-3 xl:space-y-0 xl:flex xl:justify-end xl:items-center xl:space-x-3',
})``;
