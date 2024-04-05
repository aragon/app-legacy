import {ButtonText} from '@aragon/ods-old';
import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import styled from 'styled-components';
import {Icon, IconType} from '@aragon/ods';

import {useNetwork} from 'context/network';
import {GOERLI_BASED_NETWORKS} from 'utils/constants';
import {useTranslation} from 'react-i18next';

const DeprecationBanner: React.FC = () => {
  const [bannerHidden, setBannerHidden] = useState(true);

  const location = useLocation();
  const {t} = useTranslation();

  const {network} = useNetwork();

  useEffect(() => {
    if (GOERLI_BASED_NETWORKS.includes(network)) setBannerHidden(false);
    else setBannerHidden(true);
  }, [network]);

  if (location.pathname.includes('create') || bannerHidden) {
    return null;
  }

  return (
    <UpdateContainer>
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
    </UpdateContainer>
  );
};

const UpdateContainer = styled.div.attrs({
  className:
    'flex justify-center items-center py-2 px-6 bg-warning-100' as string,
})``;

const TextWrapper = styled.div.attrs({
  className: 'flex items-center gap-x-2' as string,
})``;

const MessageWrapper = styled.div.attrs({
  className:
    'block md:flex md:items-center md:space-x-6 md:space-y-0 space-y-2' as string,
})``;

export default DeprecationBanner;
