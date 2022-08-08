import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {ButtonText, Link} from '@aragon/ui-components';

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
      <Text>
        {t('privacyPolicy.content')}{' '}
        <span className="capitalize">
          <Link label={t('privacyPolicy.title')} href="#" />.
        </span>
      </Text>

      <ButtonGroup>
        <ButtonText
          label={t('privacyPolicy.acceptAllCookies')}
          mode="secondary"
          {...(isDesktop
            ? {size: 'small', bgWhite: true}
            : {size: 'large', className: 'w-full'})}
          onClick={props.onAcceptAll}
        />
        <ButtonText
          label={t('privacyPolicy.rejectAllCookies')}
          mode="secondary"
          {...(isDesktop
            ? {size: 'small', bgWhite: true}
            : {size: 'large', className: 'w-full'})}
          onClick={props.onRejectAll}
        />
        <ButtonText
          label={t('privacyPolicy.cookieSettings')}
          {...(isDesktop
            ? {mode: 'secondary', size: 'small'}
            : {mode: 'ghost', size: 'large', className: 'w-full'})}
          onClick={props.onShowCookieSettings}
        />
      </ButtonGroup>
    </>
  );
};

export default PrivacyPolicyContent;

const Text = styled.div.attrs({
  className: 'flex-1 desktop:text-sm text-ui-600',
})``;

const ButtonGroup = styled.div.attrs({
  className:
    'space-y-1.5 desktop:space-y-0 desktop:flex desktop:justify-end desktop:items-center desktop:space-x-1.5',
})``;
