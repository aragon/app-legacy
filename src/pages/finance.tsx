import {Breadcrumb} from '@aragon/ods-old';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {Button, IconType, Tag, IllustrationHuman} from '@aragon/ods';

import {StateEmpty} from 'components/stateEmpty';
import {Loading} from 'components/temporary';
import TokenList from 'components/tokenList';
import TransferList from 'components/transferList';
import {
  PageWrapper,
  TokenSectionWrapper,
  TransferSectionWrapper,
} from 'components/wrappers';
import PageEmptyState from 'containers/pageEmptyState';
import {useGlobalModalContext} from 'context/globalModals';
import {useTransactionDetailContext} from 'context/transactionDetail';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoVault} from 'hooks/useDaoVault';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';
import useScreen from 'hooks/useScreen';
import {trackEvent} from 'services/analytics';
import {htmlIn} from 'utils/htmlIn';
import {sortTokens} from 'utils/tokens';

type Sign = -1 | 0 | 1;
const colors: Record<Sign, string> = {
  '-1': 'text-critical-800',
  '1': 'text-success-600',
  '0': 'text-neutral-600',
};

export const Finance: React.FC = () => {
  const {t} = useTranslation();
  const {data: daoDetails, isLoading} = useDaoDetailsQuery();
  const {open} = useGlobalModalContext();
  const {isMobile, isDesktop} = useScreen();

  // load dao details
  const navigate = useNavigate();
  const {breadcrumbs, icon, tag} = useMappedBreadcrumbs();

  const {handleTransferClicked} = useTransactionDetailContext();
  const {
    tokens,
    totalAssetChange,
    totalAssetValue,
    transfers,
    isDaoBalancePositive,
    isCumulativeStatsLoading,
    isTokensLoading,
    isTransfersLoading,
  } = useDaoVault();

  sortTokens(tokens, 'treasurySharePercentage', true);

  /*************************************************
   *                    Render                     *
   *************************************************/
  if (
    isLoading ||
    isTokensLoading ||
    isTransfersLoading ||
    isCumulativeStatsLoading
  ) {
    return <Loading />;
  }

  if (isDesktop) {
    // full page empty state
    if (tokens.length === 0 && transfers.length === 0) {
      return (
        <PageEmptyState
          title={t('finance.emptyState.title')}
          subtitle={htmlIn(t)('finance.emptyState.description')}
          Illustration={
            <div className="flex">
              <IllustrationHuman
                body="CHART"
                expression="EXCITED"
                hairs="BUN"
                object="WALLET"
                objectPosition="right"
              />
            </div>
          }
          primaryButton={{
            label: t('finance.emptyState.buttonLabel'),
            onClick: () => open('deposit'),
          }}
        />
      );
    }

    // tokens only empty state
    if (tokens.length === 0 && !isDaoBalancePositive) {
      return (
        <PageWrapper includeHeader={false}>
          <div className="mb-16 mt-10">
            <StateEmpty
              type="Human"
              mode="card"
              body="BLOCKS"
              expression="SURPRISED"
              sunglasses="SMALL_INTELLECTUAL"
              hairs="LONG"
              accessory="FLUSHED"
              title={t('finance.treasuryEmptyState.title')}
              description={htmlIn(t)('finance.treasuryEmptyState.desc')}
              renderHtml
              primaryButton={{
                label: t('finance.emptyState.buttonLabel'),
                onClick: () => {
                  open('deposit');
                },
              }}
            />
          </div>
          <TransferSectionWrapper
            title={t('finance.transferSection')}
            showButton
          >
            <ListContainer>
              <TransferList
                transfers={transfers.slice(0, 5)}
                onTransferClick={handleTransferClicked}
              />
            </ListContainer>
          </TransferSectionWrapper>
        </PageWrapper>
      );
    }
  }

  if (isMobile) {
    // full page empty state
    if (tokens.length === 0 && transfers.length === 0) {
      return (
        <PageWrapper
          customHeader={
            <HeaderContainer>
              <Header>
                <Breadcrumb
                  icon={icon}
                  crumbs={breadcrumbs}
                  tag={tag}
                  onClick={navigate}
                />
                <ContentContainer>
                  <TextContainer>
                    <Title>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(totalAssetValue)}
                    </Title>

                    <SubtitleContainer>
                      <Tag label="24h" />
                      <Description
                        className={colors[Math.sign(totalAssetChange) as Sign]}
                      >
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          signDisplay: 'always',
                        }).format(totalAssetChange)}
                      </Description>
                    </SubtitleContainer>
                  </TextContainer>

                  {/* Button */}
                  <Button
                    size="lg"
                    variant="primary"
                    iconLeft={IconType.PLUS}
                    className="w-full md:w-auto"
                    onClick={() => {
                      trackEvent('finance_newTransferBtn_clicked', {
                        dao_address: daoDetails?.address,
                      });
                      open('transfer');
                    }}
                  >
                    {t('TransferModal.newTransfer')}
                  </Button>
                </ContentContainer>
              </Header>
            </HeaderContainer>
          }
        >
          <PageEmptyState
            title={t('finance.emptyState.title')}
            subtitle={htmlIn(t)('finance.emptyState.description')}
            Illustration={
              <IllustrationHuman
                body="CHART"
                expression="EXCITED"
                hairs="BUN"
                object="WALLET"
                objectPosition="right"
              />
            }
            primaryButton={{
              label: t('finance.emptyState.buttonLabel'),
              onClick: () => open('deposit'),
            }}
          />
        </PageWrapper>
      );
    }

    // tokens only empty state
    if (tokens.length === 0 && !isDaoBalancePositive) {
      return (
        <PageWrapper
          customHeader={
            <HeaderContainer>
              <Header>
                <Breadcrumb
                  icon={icon}
                  crumbs={breadcrumbs}
                  tag={tag}
                  onClick={navigate}
                />
                <StateEmpty
                  type="Human"
                  mode="inline"
                  body="BLOCKS"
                  expression="SURPRISED"
                  sunglasses="SMALL_INTELLECTUAL"
                  hairs="LONG"
                  accessory="FLUSHED"
                  title={t('finance.treasuryEmptyState.title')}
                  description={htmlIn(t)('finance.treasuryEmptyState.desc')}
                  renderHtml
                  primaryButton={{
                    label: t('finance.emptyState.buttonLabel'),
                    onClick: () => {
                      open('deposit');
                    },
                  }}
                />
              </Header>
            </HeaderContainer>
          }
        >
          <div className="mt-2">
            <TransferSectionWrapper
              title={t('finance.transferSection')}
              showButton
            >
              <ListContainer>
                <TransferList
                  transfers={transfers.slice(0, 5)}
                  onTransferClick={handleTransferClicked}
                />
              </ListContainer>
            </TransferSectionWrapper>
          </div>
        </PageWrapper>
      );
    }
  }

  // tokens and transfers are available
  return (
    <PageWrapper
      customHeader={
        <HeaderContainer>
          <Header>
            {!isDesktop && (
              <Breadcrumb
                icon={icon}
                crumbs={breadcrumbs}
                tag={tag}
                onClick={navigate}
              />
            )}
            <ContentContainer>
              <TextContainer>
                <Title>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(totalAssetValue)}
                </Title>

                <SubtitleContainer>
                  <Tag label="24h" />
                  <Description
                    className={colors[Math.sign(totalAssetChange) as Sign]}
                  >
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      signDisplay: 'always',
                    }).format(totalAssetChange)}
                  </Description>
                </SubtitleContainer>
              </TextContainer>

              {/* Button */}
              <Button
                size="lg"
                variant="primary"
                iconLeft={IconType.PLUS}
                className="w-full md:w-auto"
                onClick={() => {
                  trackEvent('finance_newTransferBtn_clicked', {
                    dao_address: daoDetails?.address,
                  });
                  open('transfer');
                }}
              >
                {t('TransferModal.newTransfer')}
              </Button>
            </ContentContainer>
          </Header>
        </HeaderContainer>
      }
    >
      {tokens.length !== 0 && (
        <div className={'mb-6 mt-2 md:mb-16 md:mt-10'}>
          <TokenSectionWrapper title={t('finance.tokenSection')}>
            <ListContainer>
              <TokenList tokens={tokens.slice(0, 5)} />
            </ListContainer>
          </TokenSectionWrapper>
        </div>
      )}
      <TransferSectionWrapper title={t('finance.transferSection')} showButton>
        <ListContainer>
          <TransferList
            transfers={transfers.slice(0, 5)}
            onTransferClick={handleTransferClicked}
          />
        </ListContainer>
      </TransferSectionWrapper>
    </PageWrapper>
  );
};

const ListContainer = styled.div.attrs({
  className: 'py-4 space-y-4',
})``;

const HeaderContainer = styled.div.attrs({
  className: 'col-span-full xl:col-start-3 xl:col-end-11 -mx-4 md:mx-0 md:mt-6',
})``;

const SubtitleContainer = styled.div.attrs({
  className: 'flex gap-x-3 items-center mt-2',
})``;

const Header = styled.div.attrs({
  className: `p-4 xl:p-0 pb-6 xl:mt-10 space-y-4 md:space-y-6
   bg-neutral-0 xl:bg-[transparent] md:rounded-xl md:border
   md:border-neutral-100 xl:border-none md:shadow-neutral xl:shadow-[0_0_#0000]`,
})``;

const ContentContainer = styled.div.attrs({
  className: `flex flex-col md:flex-row md:gap-x-12 gap-y-4
     md: gap - y - 3 md: items - start xl: items - center`,
})``;

const TextContainer = styled.div.attrs({
  className: 'md:flex-1 space-y-2 capitalize',
})``;

const Title = styled.h1.attrs({
  className: 'font-semibold text-neutral-800 ft-text-3xl',
})``;

const Description = styled.p.attrs({
  className: 'ft-text-lg' as string,
})``;
