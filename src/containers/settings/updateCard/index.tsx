import {IconLinkExternal, IconUpdate} from '@aragon/ods';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {StyledLink} from 'components/styledLink';
import useScreen from 'hooks/useScreen';

export const SettingsUpdateCard: React.FC = () => {
  const {t} = useTranslation();
  const {isDesktop} = useScreen();

  if (isDesktop) {
    return (
      <Container className="desktop:gap-x-3 desktop:p-3">
        <div className="flex gap-x-6 items-start">
          <div className="flex-1 space-y-1">
            <Head>
              {/* <IconUpdate /> */}
              <Title>{t('update.alert.title')}</Title>
            </Head>
            <ContentWrapper className="space-y-0">
              <Description>{t('update.alert.desc')}</Description>
            </ContentWrapper>
          </div>
          <StyledLink
            label={t('update.alert.ctaLabel')}
            type="neutral"
            iconRight={<IconLinkExternal />}
            //TODO add onclick/href
          />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Head>
        <IconUpdate />
        <Title>{t('update.alert.title')}</Title>
      </Head>
      <ContentWrapper>
        <Description>{t('update.alert.desc')}</Description>
        <StyledLink
          label={t('update.alert.ctaLabel')}
          type="neutral"
          iconRight={<IconLinkExternal />}
        />
      </ContentWrapper>
    </Container>
  );
};

const Container = styled.div.attrs({
  className: 'gap-x-2 p-2 space-y-1 bg-primary-400 rounded-xl' as string,
})``;

const Head = styled.div.attrs({
  className: 'flex items-center space-x-1.5 font-semibold text-ui-0 ft-text-lg',
})``;

const Title = styled.p.attrs({})``;

const Description = styled.p.attrs({className: 'ft-text-base'})``;

const ContentWrapper = styled.div.attrs({
  className: 'pl-3.5 space-y-1.5 text-primary-50' as string,
})``;
