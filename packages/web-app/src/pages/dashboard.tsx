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
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';

import {Loading} from 'components/temporary';
import {MembershipSnapshot} from 'containers/membershipSnapshot';
import ProposalSnapshot from 'containers/proposalSnapshot';
import TreasurySnapshot from 'containers/treasurySnapshot';
import {useAlertContext} from 'context/alert';
import {NavigationDao} from 'context/apolloClient';
import {useNetwork} from 'context/network';
import {useDaoQuery} from 'hooks/useDaoDetails';
import {useDaoVault} from 'hooks/useDaoVault';
import {
  useAddFavoriteDaoMutation,
  useFavoritedDaosQuery,
  useRemoveFavoriteDaoMutation,
} from 'hooks/useFavoritedDaos';
import {usePendingDao, useRemovePendingDaoMutation} from 'hooks/usePendingDao';
import {PluginTypes} from 'hooks/usePluginClient';
import {useProposals} from 'hooks/useProposals';
import useScreen from 'hooks/useScreen';
import {CHAIN_METADATA} from 'utils/constants';
import {formatDate} from 'utils/date';
import {toDisplayEns} from 'utils/library';
import {Dashboard as DashboardPath, NotFound} from 'utils/paths';
import {Container} from './governance';
import {
  EmptyStateContainer,
  EmptyStateHeading,
} from 'containers/pageEmptyState';

enum DaoCreationState {
  ASSEMBLING_DAO,
  DAO_READY,
  OPEN_DAO,
}

const Dashboard: React.FC = () => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const {isDesktop, isMobile} = useScreen();

  const navigate = useNavigate();
  const {network} = useNetwork();
  const {dao: urlAddressOrEns} = useParams();

  const [pollInterval, setPollInterval] = useState(0);
  const [daoCreationState, setDaoCreationState] = useState<DaoCreationState>(
    DaoCreationState.ASSEMBLING_DAO
  );

  // favoring DAOS
  const addFavoriteDaoMutation = useAddFavoriteDaoMutation(() =>
    alert(t('alert.chip.favorited'))
  );

  const removeFavoriteDaoMutation = useRemoveFavoriteDaoMutation(() =>
    alert(t('alert.chip.unfavorite'))
  );

  const {data: favoritedDaos, isLoading: favoritedDaosLoading} =
    useFavoritedDaosQuery();

  // live DAO
  const {
    data: liveDao,
    isLoading: liveDaoLoading,
    isSuccess,
  } = useDaoQuery(urlAddressOrEns, pollInterval);
  const liveAddressOrEns = toDisplayEns(liveDao?.ensDomain) || liveDao?.address;

  // pending DAO
  const {data: pendingDao, isLoading: pendingDaoLoading} =
    usePendingDao(urlAddressOrEns);

  const removePendingDaoMutation = useRemovePendingDaoMutation(() =>
    navigate(
      generatePath(DashboardPath, {
        network,
        dao: liveAddressOrEns,
      })
    )
  );

  const favoriteDaoMatchPredicate = useCallback(
    (favoriteDao: NavigationDao) => {
      return (
        favoriteDao.address.toLowerCase() === liveDao?.address.toLowerCase() &&
        favoriteDao.chain === CHAIN_METADATA[network].id
      );
    },
    [liveDao?.address, network]
  );

  const isFavoritedDao = useMemo(() => {
    if (liveDao?.address && favoritedDaos)
      return Boolean(favoritedDaos.some(favoriteDaoMatchPredicate));
    else return false;
  }, [favoriteDaoMatchPredicate, favoritedDaos, liveDao?.address]);

  /*************************************************
   *                    Hooks                      *
   *************************************************/
  useEffect(() => {
    // poll for the newly created DAO while waiting to be indexed
    if (pendingDao && isSuccess && !liveDao) {
      setPollInterval(1000);
    }
  }, [isSuccess, liveDao, pendingDao]);

  useEffect(() => {
    if (
      pendingDao &&
      liveDao &&
      daoCreationState === DaoCreationState.ASSEMBLING_DAO
    ) {
      setPollInterval(0);
      setDaoCreationState(DaoCreationState.DAO_READY);
      setTimeout(() => setDaoCreationState(DaoCreationState.OPEN_DAO), 2000);
    }
  }, [liveDao, daoCreationState, pendingDao]);

  /*************************************************
   *                    Handlers                   *
   *************************************************/
  const handleOpenYourDaoClick = useCallback(async () => {
    if (daoCreationState === DaoCreationState.OPEN_DAO) {
      try {
        await removePendingDaoMutation.mutateAsync({
          network,
          daoAddress: pendingDao?.address,
        });
      } catch (error) {
        console.error(
          `Error removing pending dao:${pendingDao?.address}`,
          error
        );
      }
    }
  }, [
    daoCreationState,
    network,
    pendingDao?.address,
    removePendingDaoMutation,
  ]);

  const handleClipboardActions = useCallback(async () => {
    await navigator.clipboard.writeText(
      `app.aragon.org/#/daos/${network}/${liveAddressOrEns}`
    );
    alert(t('alert.chip.inputCopied'));
  }, [alert, liveAddressOrEns, network, t]);

  const handleFavoriteClick = useCallback(
    async (dao: NavigationDao) => {
      try {
        if (isFavoritedDao) {
          await removeFavoriteDaoMutation.mutateAsync({dao});
        } else {
          await addFavoriteDaoMutation.mutateAsync({dao});
        }
      } catch (error) {
        const action = isFavoritedDao
          ? 'removing DAO from favorites'
          : 'adding DAO to favorites';

        console.error(`Error ${action}`, error);
      }
    },
    [isFavoritedDao, removeFavoriteDaoMutation, addFavoriteDaoMutation]
  );

  /*************************************************
   *                    Render                     *
   *************************************************/
  if (pendingDaoLoading || liveDaoLoading || favoritedDaosLoading) {
    return <Loading />;
  }

  if (pendingDao) {
    const buttonLabel = {
      [DaoCreationState.ASSEMBLING_DAO]: t('dashboard.emptyState.buildingDAO'),
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
            onClick={handleOpenYourDaoClick}
          />
        </EmptyStateContainer>
      </Container>
    );
  }

  if (liveDao && liveAddressOrEns) {
    const daoType =
      (liveDao?.plugins[0]?.id as PluginTypes) === 'multisig.plugin.dao.eth'
        ? t('explore.explorer.walletBased')
        : t('explore.explorer.tokenBased');

    return (
      <>
        <HeaderWrapper>
          <HeaderDao
            daoName={liveDao.metadata.name}
            daoEnsName={toDisplayEns(liveDao.ensDomain)}
            daoAvatar={liveDao.metadata.avatar}
            daoUrl={`app.aragon.org/#/daos/${network}/${liveAddressOrEns}`}
            description={liveDao.metadata.description}
            created_at={formatDate(
              liveDao.creationDate.getTime() / 1000,
              'MMMM yyyy'
            ).toString()}
            daoChain={network}
            daoType={daoType}
            favorited={isFavoritedDao}
            copiedOnClick={handleClipboardActions}
            onFavoriteClick={() =>
              handleFavoriteClick({
                address: liveDao.address.toLowerCase(),
                chain: CHAIN_METADATA[network].id,
                ensDomain: liveDao.ensDomain,
                plugins: liveDao.plugins,
                metadata: {
                  name: liveDao.metadata.name,
                  avatar: liveDao.metadata.avatar,
                  description: liveDao.metadata.description,
                },
              })
            }
            links={
              liveDao.metadata?.links
                ?.filter(link => link.name !== '' && link.url !== '')
                .map(link => ({
                  label: link.name,
                  href: link.url,
                })) || []
            }
          />
        </HeaderWrapper>

        {isDesktop ? (
          <DashboardContent
            daoAddressOrEns={liveAddressOrEns}
            pluginType={liveDao.plugins[0].id as PluginTypes}
            pluginAddress={liveDao.plugins[0].instanceAddress || ''}
          />
        ) : (
          <MobileDashboardContent
            daoAddressOrEns={liveAddressOrEns}
            pluginType={liveDao.plugins[0].id as PluginTypes}
            pluginAddress={liveDao.plugins[0].instanceAddress || ''}
          />
        )}
      </>
    );
  } else if (!pendingDao && !liveDao) {
    // if DAO isn't loading and there is no pending or live DAO, then
    // navigate to notFound
    navigate(NotFound, {
      replace: true,
      state: {incorrectDao: urlAddressOrEns},
    });
  }

  return null;
};

const HeaderWrapper = styled.div.attrs({
  className:
    'w-screen -mx-2 tablet:col-span-full tablet:w-full tablet:mx-0 desktop:col-start-2 desktop:col-span-10 tablet:mt-3',
})``;

/* DESKTOP DASHBOARD ======================================================== */

type DashboardContentProps = {
  daoAddressOrEns: string;
  pluginType: PluginTypes;
  pluginAddress: string;
};

const DashboardContent: React.FC<DashboardContentProps> = ({
  daoAddressOrEns,
  pluginType,
  pluginAddress,
}) => {
  const {transfers, totalAssetValue} = useDaoVault();
  const {data: proposals} = useProposals(daoAddressOrEns, pluginType);

  const proposalCount = proposals.length;
  const transactionCount = transfers.length;

  if (!proposalCount) {
    return (
      <>
        {!transactionCount ? (
          <EqualDivide>
            <ProposalSnapshot
              daoAddressOrEns={daoAddressOrEns}
              pluginAddress={pluginAddress}
              pluginType={pluginType}
              proposals={proposals}
            />
            <TreasurySnapshot
              daoAddressOrEns={daoAddressOrEns}
              transfers={transfers}
              totalAssetValue={totalAssetValue}
            />
          </EqualDivide>
        ) : (
          <>
            <LeftWideContent>
              <ProposalSnapshot
                daoAddressOrEns={daoAddressOrEns}
                pluginAddress={pluginAddress}
                pluginType={pluginType}
                proposals={proposals}
              />
            </LeftWideContent>
            <RightNarrowContent>
              <TreasurySnapshot
                daoAddressOrEns={daoAddressOrEns}
                transfers={transfers}
                totalAssetValue={totalAssetValue}
              />
            </RightNarrowContent>
          </>
        )}
        <MembersWrapper>
          <MembershipSnapshot
            daoAddressOrEns={daoAddressOrEns}
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
        <ProposalSnapshot
          daoAddressOrEns={daoAddressOrEns}
          pluginAddress={pluginAddress}
          pluginType={pluginType}
          proposals={proposals}
        />
      </LeftWideContent>
      <RightNarrowContent>
        <TreasurySnapshot
          daoAddressOrEns={daoAddressOrEns}
          transfers={transfers}
          totalAssetValue={totalAssetValue}
        />
        <MembershipSnapshot
          daoAddressOrEns={daoAddressOrEns}
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
  daoAddressOrEns,
  pluginType,
  pluginAddress,
}) => {
  const {transfers, totalAssetValue} = useDaoVault();
  const {data: proposals} = useProposals(daoAddressOrEns, pluginType);

  return (
    <MobileLayout>
      <ProposalSnapshot
        daoAddressOrEns={daoAddressOrEns}
        pluginAddress={pluginAddress}
        pluginType={pluginType}
        proposals={proposals}
      />
      <TreasurySnapshot
        daoAddressOrEns={daoAddressOrEns}
        transfers={transfers}
        totalAssetValue={totalAssetValue}
      />
      <MembershipSnapshot
        daoAddressOrEns={daoAddressOrEns}
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
