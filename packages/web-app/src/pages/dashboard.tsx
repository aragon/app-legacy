import {useReactiveVar} from '@apollo/client';
import {
  ButtonText,
  HeaderDao,
  IconCheckmark,
  IconSpinner,
  IlluObject,
  IllustrationHuman,
} from '@aragon/ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {Loading} from 'components/temporary';
import {MembershipSnapshot} from 'containers/membershipSnapshot';
import ProposalSnapshot from 'containers/proposalSnapshot';
import TreasurySnapshot from 'containers/treasurySnapshot';
import {useAlertContext} from 'context/alert';
import {
  favoriteDaosVar,
  NavigationDao,
  pendingDaoCreationVar,
} from 'context/apolloClient';
import {useNetwork} from 'context/network';
import {usePrivacyContext} from 'context/privacyContext';
import {useClient} from 'hooks/useClient';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {useDaoVault} from 'hooks/useDaoVault';
import {PluginTypes} from 'hooks/usePluginClient';
import {Proposal, useProposals} from 'hooks/useProposals';
import useScreen from 'hooks/useScreen';
import {
  CHAIN_METADATA,
  FAVORITE_DAOS_KEY,
  PENDING_DAOS_KEY,
} from 'utils/constants';
import {formatDate} from 'utils/date';
import {Dashboard as DashboardPath} from 'utils/paths';
import {Transfer} from 'utils/types';
import {Container, EmptyStateContainer, EmptyStateHeading} from './governance';

let pollForDaoData: number | undefined;

enum DaoCreationState {
  ASSEMBLING_DAO,
  DAO_READY,
  OPEN_DAO,
}

const Dashboard: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {isDesktop, isMobile} = useScreen();
  const {alert} = useAlertContext();
  const {client} = useClient();
  const {preferences, handleWithFunctionalPreferenceMenu} = usePrivacyContext();
  const favoriteDaoCache = useReactiveVar(favoriteDaosVar);

  const {
    data: daoId,
    isLoading: daoParamLoading,
    waitingForSubgraph,
  } = useDaoParam();

  const [daoCreationState, setDaoCreationState] = useState<DaoCreationState>(
    DaoCreationState.ASSEMBLING_DAO
  );
  const cachedDaoCreation = useReactiveVar(pendingDaoCreationVar);
  const navigate = useNavigate();

  const {transfers, totalAssetValue} = useDaoVault(daoId!);
  const {data: dao, isLoading: detailsAreLoading} = useDaoDetails(daoId!);

  const {data: topTen, isLoading: proposalsAreLoading} = useProposals(
    daoId,
    dao?.plugins[0]?.id as PluginTypes
  );

  const daoType =
    (dao?.plugins[0]?.id as PluginTypes) === 'addresslist-voting.plugin.dao.eth'
      ? t('explore.explorer.walletBased')
      : t('explore.explorer.tokenBased');

  const favoriteDaoMatchPredicate = useCallback(
    (favoriteDao: NavigationDao) =>
      favoriteDao.address === daoId &&
      favoriteDao.chain === CHAIN_METADATA[network].id,
    [daoId, network]
  );

  const isFavoritedDao = useMemo(
    () => favoriteDaoCache.some(favoriteDaoMatchPredicate),
    [favoriteDaoCache, favoriteDaoMatchPredicate]
  );

  /*************************************************
   *                    Hooks                      *
   *************************************************/
  useEffect(() => {
    if (
      waitingForSubgraph &&
      !pollForDaoData &&
      daoCreationState === DaoCreationState.ASSEMBLING_DAO
    ) {
      pollForDaoData = window.setInterval(async () => {
        try {
          const dao = await client?.methods.getDao(daoId);

          if (dao) {
            clearInterval(pollForDaoData);
            pollForDaoData = undefined;

            setDaoCreationState(DaoCreationState.DAO_READY);

            setTimeout(
              () => setDaoCreationState(DaoCreationState.OPEN_DAO),
              3000
            );
          }
        } catch (err) {
          console.error(err);
        }
      }, 1000);
    }

    return () => {
      clearInterval(pollForDaoData);
      pollForDaoData = undefined;
    };
  }, [client?.methods, daoCreationState, daoId, waitingForSubgraph]);

  /*************************************************
   *                    Handlers                   *
   *************************************************/
  const handleFavoriteClick = useCallback(() => {
    if (!dao) return;

    handleWithFunctionalPreferenceMenu(() => {
      let newCache;

      if (isFavoritedDao) {
        newCache = favoriteDaoCache.filter(
          fd => !favoriteDaoMatchPredicate(fd)
        );
      } else {
        const newFavoriteDao: NavigationDao = {
          address: dao.address.toLowerCase(),
          chain: CHAIN_METADATA[network].id,
          ensDomain: dao.ensDomain,
          plugins: dao.plugins,
          metadata: {
            name: dao.metadata.name,
            avatar: dao.metadata.avatar,
            description: dao.metadata.description,
          },
        };

        newCache = [...favoriteDaoCache, newFavoriteDao];
      }

      favoriteDaosVar(newCache);
      localStorage.setItem(FAVORITE_DAOS_KEY, JSON.stringify(newCache));

      isFavoritedDao
        ? alert(t('alert.chip.unfavorite'))
        : alert(t('alert.chip.favorited'));
    });
  }, [
    alert,
    dao,
    favoriteDaoCache,
    favoriteDaoMatchPredicate,
    handleWithFunctionalPreferenceMenu,
    isFavoritedDao,
    network,
    t,
  ]);

  /*************************************************
   *                    Render                     *
   *************************************************/
  if (proposalsAreLoading || detailsAreLoading || daoParamLoading) {
    return <Loading />;
  }

  if (waitingForSubgraph) {
    const buttonLabel = {
      [DaoCreationState.ASSEMBLING_DAO]: t(
        'dashboard.emptyState.assemblingDao'
      ),
      [DaoCreationState.DAO_READY]: t('dashboard.emptyState.daoReady'),
      [DaoCreationState.OPEN_DAO]: t('dashboard.emptyState.openDao'),
    };

    const buttonIcon = {
      [DaoCreationState.ASSEMBLING_DAO]: (
        <IconSpinner className="w-1.5 desktop:w-2 h-1.5 desktop:h-2 animate-spin" />
      ),
      [DaoCreationState.DAO_READY]: <IconCheckmark />,
      [DaoCreationState.OPEN_DAO]: undefined,
    };

    return (
      <Container>
        <EmptyStateContainer>
          <IllustrationHuman
            body="blocks"
            expression="casual"
            sunglass="big_rounded"
            hair="short"
            {...(isMobile
              ? {height: 165, width: 295}
              : {height: 225, width: 400})}
          />
          <div className="absolute transform -translate-x-2/3">
            <IlluObject
              object="build"
              {...(isMobile
                ? {height: 120, width: 120}
                : {height: 160, width: 160})}
            />
          </div>

          <EmptyStateHeading>
            {t('dashboard.emptyState.title')}
          </EmptyStateHeading>
          <p className="mt-1.5 text-base text-center">
            {t('dashboard.emptyState.subtitle')}
          </p>
          <ButtonText
            size="large"
            label={buttonLabel[daoCreationState]}
            iconLeft={buttonIcon[daoCreationState]}
            className={`mt-4 ${daoCreationState === 0 && 'bg-primary-800'}`}
            onClick={() => {
              if (daoCreationState === DaoCreationState.OPEN_DAO) {
                const newCache = {...cachedDaoCreation};
                delete newCache?.[network]?.[daoId];

                pendingDaoCreationVar(newCache);

                if (preferences?.functional) {
                  localStorage.setItem(
                    PENDING_DAOS_KEY,
                    JSON.stringify(newCache)
                  );
                }

                navigate(
                  generatePath(DashboardPath, {
                    network,
                    dao: daoId,
                  })
                );
              }
            }}
          />
        </EmptyStateContainer>
      </Container>
    );
  }

  if (!dao) return null;

  async function handleClipboardActions() {
    await navigator.clipboard.writeText(
      `app.aragon.org/#/daos/${network}/${daoId}`
    );
    alert(t('alert.chip.inputCopied'));
  }

  return (
    <>
      <HeaderWrapper>
        <HeaderDao
          daoName={dao.metadata.name}
          daoAvatar={dao.metadata.avatar}
          daoUrl={`app.aragon.org/#/daos/${network}/${daoId}`}
          description={dao.metadata.description}
          created_at={formatDate(
            dao.creationDate.getTime() / 1000,
            'MMMM yyyy'
          ).toString()}
          daoChain={network}
          daoType={daoType}
          favorited={isFavoritedDao}
          copiedOnClick={handleClipboardActions}
          onFavoriteClick={handleFavoriteClick}
          links={
            dao?.metadata?.links?.flatMap(link => {
              if (link.name !== '' && link.url !== '')
                return {
                  label: link.name,
                  href: link.url,
                };
              else return [];
            }) || []
          }
        />
      </HeaderWrapper>

      {isDesktop ? (
        <DashboardContent
          dao={daoId}
          proposals={topTen}
          transfers={transfers}
          totalAssetValue={totalAssetValue}
          pluginType={dao?.plugins[0].id as PluginTypes}
          pluginAddress={dao?.plugins[0].instanceAddress || ''}
        />
      ) : (
        <MobileDashboardContent
          dao={daoId}
          proposals={topTen}
          transfers={transfers}
          totalAssetValue={totalAssetValue}
          pluginType={dao?.plugins[0].id as PluginTypes}
          pluginAddress={dao?.plugins[0].instanceAddress || ''}
        />
      )}
    </>
  );
};

const HeaderWrapper = styled.div.attrs({
  className:
    'w-screen -mx-2 tablet:col-span-full tablet:w-full tablet:mx-0 desktop:col-start-2 desktop:col-span-10 tablet:mt-3',
})``;

/* DESKTOP DASHBOARD ======================================================== */

type DashboardContentProps = {
  dao: string;
  proposals: Proposal[];
  transfers: Transfer[];
  totalAssetValue: number;
  pluginType: PluginTypes;
  pluginAddress: string;
};

const DashboardContent: React.FC<DashboardContentProps> = ({
  proposals,
  transfers,
  dao,
  totalAssetValue,
  pluginType,
  pluginAddress,
}) => {
  const proposalCount = proposals.length;
  const transactionCount = transfers.length;

  if (!proposalCount) {
    return (
      <>
        {!transactionCount ? (
          <EqualDivide>
            <ProposalSnapshot dao={dao} proposals={proposals} />
            <TreasurySnapshot
              dao={dao}
              transfers={transfers}
              totalAssetValue={totalAssetValue}
            />
          </EqualDivide>
        ) : (
          <>
            <LeftWideContent>
              <ProposalSnapshot dao={dao} proposals={proposals} />
            </LeftWideContent>
            <RightNarrowContent>
              <TreasurySnapshot
                dao={dao}
                transfers={transfers}
                totalAssetValue={totalAssetValue}
              />
            </RightNarrowContent>
          </>
        )}
        <MembersWrapper>
          <MembershipSnapshot
            dao={dao}
            pluginType={pluginType}
            pluginAddress={pluginAddress}
            horizontal
          />
        </MembersWrapper>
      </>
    );
  }

  return (
    <>
      <LeftWideContent>
        <ProposalSnapshot dao={dao} proposals={proposals} />
      </LeftWideContent>
      <RightNarrowContent>
        <TreasurySnapshot
          dao={dao}
          transfers={transfers}
          totalAssetValue={totalAssetValue}
        />
        <MembershipSnapshot
          dao={dao}
          pluginType={pluginType}
          pluginAddress={pluginAddress}
        />
      </RightNarrowContent>
    </>
  );
};

// NOTE: These Containers are built SPECIFICALLY FOR >= DESKTOP SCREENS. Since
// the mobile layout is much simpler, it has it's own component.

const LeftWideContent = styled.div.attrs({
  className: 'desktop:space-y-5 desktop:col-start-2 desktop:col-span-6',
})``;

const RightNarrowContent = styled.div.attrs({
  className: 'desktop:col-start-8 desktop:col-span-4 desktop:space-y-3',
})``;

const EqualDivide = styled.div.attrs({
  className:
    'desktop:col-start-2 desktop:col-span-10 desktop:flex desktop:space-x-3',
})``;

const MembersWrapper = styled.div.attrs({
  className: 'desktop:col-start-2 desktop:col-span-10',
})``;

/* MOBILE DASHBOARD CONTENT ================================================= */

const MobileDashboardContent: React.FC<DashboardContentProps> = ({
  dao,
  proposals,
  transfers,
  totalAssetValue,
  pluginType,
  pluginAddress,
}) => {
  return (
    <MobileLayout>
      <ProposalSnapshot dao={dao} proposals={proposals} />
      <TreasurySnapshot
        dao={dao}
        transfers={transfers}
        totalAssetValue={totalAssetValue}
      />
      <MembershipSnapshot
        dao={dao}
        pluginType={pluginType}
        pluginAddress={pluginAddress}
      />
    </MobileLayout>
  );
};

const MobileLayout = styled.div.attrs({
  className: 'col-span-full space-y-5',
})``;

export default withTransaction('Dashboard', 'component')(Dashboard);
