import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import {Icon, IconType} from '@aragon/ods';

import {StyledLink} from 'components/styledLink';
import useScreen from 'hooks/useScreen';
import {useNetwork} from 'context/network';
import {NewProposal} from 'utils/paths';
import {ProposalTypes} from 'utils/types';

export const SettingsUpdateCard: React.FC = () => {
  const {t} = useTranslation();
  const {isDesktop} = useScreen();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {dao} = useParams();

  if (isDesktop) {
    return (
      <Container className="xl:gap-x-6 xl:p-6">
        <div className="flex items-start gap-x-12">
          <div className="flex-1 space-y-2">
            <Head>
              <Icon icon={IconType.RELOAD} />
              <Title>{t('update.alert.title')}</Title>
            </Head>
            <ContentWrapper className="space-y-0">
              <Description>{t('update.alert.desc')}</Description>
            </ContentWrapper>
          </div>
          <StyledLink
            label={t('update.alert.ctaLabel')}
            type="neutral"
            iconRight={IconType.LINK_EXTERNAL}
            onClick={() =>
              navigate(
                generatePath(NewProposal, {
                  type: ProposalTypes.OSUpdates,
                  network,
                  dao: dao,
                })
              )
            }
            //TODO add onclick/href
          />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Head>
        <Icon icon={IconType.RELOAD} />
        <Title>{t('update.alert.title')}</Title>
      </Head>
      <ContentWrapper>
        <Description>{t('update.alert.desc')}</Description>
        <StyledLink
          label={t('update.alert.ctaLabel')}
          type="neutral"
          iconRight={IconType.LINK_EXTERNAL}
          onClick={() =>
            navigate(
              generatePath(NewProposal, {
                type: 'os-update',
                network,
                dao: dao,
              })
            )
          }
        />
      </ContentWrapper>
    </Container>
  );
};

const Container = styled.div.attrs({
  className: 'gap-x-4 p-4 space-y-2 bg-primary-400 rounded-xl' as string,
})``;

const Head = styled.div.attrs({
  className:
    'flex items-center space-x-3 font-semibold text-neutral-0 ft-text-lg',
})``;

const Title = styled.p.attrs({})``;

const Description = styled.p.attrs({className: 'ft-text-base'})``;

const ContentWrapper = styled.div.attrs({
  className: 'pl-7 space-y-3 text-primary-50' as string,
})``;
