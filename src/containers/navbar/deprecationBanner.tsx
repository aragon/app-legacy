import {ButtonText} from '@aragon/ods-old';
import React, {useState} from 'react';
import {useLocation} from 'react-router-dom';
import styled from 'styled-components';
import {Icon, IconType} from '@aragon/ods';

import {useNetwork} from 'context/network';
import {featureFlags} from 'utils/featureFlags';
import {GOERLI_BASED_NETWORKS} from 'utils/constants';
import {useTranslation} from 'react-i18next';

const DeprecationBanner: React.FC = () => {
  const [bannerHidden, setBannerHidden] = useState(false);

  const location = useLocation();
  const {t} = useTranslation();

  const {network} = useNetwork();

  const daoDeprecationWarningEnabled =
    featureFlags.getValue('VITE_FEATURE_FLAG_DEPRECATE_GOERLI') === 'true';

  const showBanner = GOERLI_BASED_NETWORKS.includes(network) || !bannerHidden;

  if (
    location.pathname.includes('create') ||
    showBanner === false ||
    !daoDeprecationWarningEnabled
  )
    return null;

  return (
    <UpdateContainer>
      <DummyElement />
      <MessageWrapper>
        <TextWrapper>
          <Icon icon={IconType.WARNING} className="text-warning-500" />
          <span className="font-semibold text-warning-800 ft-text-base">
            {t('deprecation.banner.title')}
          </span>
        </TextWrapper>
        <ButtonText
          label={t('deprecation.banner.ctaLabel')}
          size="small"
          bgWhite
          mode={'secondary'}
          onClick={() => window.open(t('deprecation.banner.ctaLink'), '_blank')}
        />
      </MessageWrapper>
      <Icon
        icon={IconType.CLOSE}
        className="cursor-pointer justify-self-end text-neutral-0"
        onClick={() => {
          setBannerHidden(true);
        }}
      />
    </UpdateContainer>
  );
};

const DummyElement = styled.div.attrs({
  className: 'md:block hidden',
})``;

const UpdateContainer = styled.div.attrs({
  className:
    'flex justify-between items-center py-2 px-6 bg-warning-100' as string,
})``;

const TextWrapper = styled.div.attrs({
  className: 'flex items-center gap-x-2' as string,
})``;

const MessageWrapper = styled.div.attrs({
  className:
    'block md:flex md:items-center md:space-x-6 md:space-y-0 space-y-2' as string,
})``;

export default DeprecationBanner;
