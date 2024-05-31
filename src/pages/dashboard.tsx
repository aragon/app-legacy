import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {HeaderDao} from '@aragon/ods-old';
import {CardEmptyState, IconType} from '@aragon/ods';

import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';

import {Loading} from 'components/temporary';
import {MembershipSnapshot} from 'containers/membershipSnapshot';

import ProposalSnapshot from 'containers/proposalSnapshot';
import TreasurySnapshot from 'containers/treasurySnapshot';
import {useAlertContext} from 'context/alert';
import {NavigationDao} from 'context/apolloClient';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useDaoQuery} from 'hooks/useDaoDetails';
import {useDaoVault} from 'hooks/useDaoVault';
import {
  useAddFollowedDaoMutation,
  useFollowedDaosQuery,
  useRemoveFollowedDaoMutation,
} from 'hooks/useFollowedDaos';
import {usePendingDao, useRemovePendingDaoMutation} from 'hooks/usePendingDao';
import {GaslessPluginName, PluginTypes} from 'hooks/usePluginClient';
import useScreen from 'hooks/useScreen';
import {useProposals} from 'services/aragon-sdk/queries/use-proposals';
import {CHAIN_METADATA} from 'utils/constants';
import {formatDate} from 'utils/date';
import {toDisplayEns} from 'utils/library';
import {Dashboard as DashboardPath, NotFound} from 'utils/paths';
import {Container} from './governance';
import {useCensus3Token} from '../services/vocdoni-census3/queries/use-census3-token';
import {useDaoToken} from '../hooks/useDaoToken';

enum DaoCreationState {
  ASSEMBLING_DAO,
  DAO_READY,
  OPEN_DAO,
}

export const Dashboard: React.FC = () => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const {isDesktop} = useScreen();

  const navigate = useNavigate();
  const {network} = useNetwork(); // queries the SDK
  const {dao: urlAddressOrEns} = useParams();

  const {open} = useGlobalModalContext();

  const [pollInterval, setPollInterval] = useState(0);
  const [daoCreationState, setDaoCreationState] = useState<DaoCreationState>(
    DaoCreationState.ASSEMBLING_DAO
  );

  // following DAOS
  const addFollowedDaoMutation = useAddFollowedDaoMutation({
    onMutate: () => {
      alert(t('alert.chip.favorited'));
    },
  });

  const removeFollowedDaoMutation = useRemoveFollowedDaoMutation({
    onMutate: () => {
      alert(t('alert.chip.unfavorite'), IconType.CLOSE);
    },
  });

  const {
    data: followedDaos,
    isLoading: followedDaosLoading,
    isFetching: followedDaosFetching,
  } = useFollowedDaosQuery();

  const enableFollowing =
    !followedDaosFetching &&
    !addFollowedDaoMutation.isPending &&
    !removeFollowedDaoMutation.isPending;

  // live DAO
  const {
    data: liveDao,
    isLoading: liveDaoLoading,
    isSuccess,
    isFetched: liveDaoFetched,
  } = useDaoQuery(urlAddressOrEns, pollInterval);
  const liveAddressOrEns =
    network !== 'sepolia'
      ? toDisplayEns(liveDao?.ensDomain) || liveDao?.address
      : liveDao?.address;

  // pending DAO
  const {
    data: pendingDao,
    isLoading: pendingDaoLoading,
    isFetched: pendingDaoFetched,
  } = usePendingDao(urlAddressOrEns);

  // Pending census for gasless plugins
  const {data: daoTokenData} = useDaoToken(
    liveDao?.plugins?.[0]?.instanceAddress || ''
  );
  const isGasless =
    (liveDao?.plugins[0].id as PluginTypes) === GaslessPluginName;
  const enableCensus3Token =
    daoTokenData && !!daoTokenData?.address && isGasless;

  const {data: census3Token} = useCensus3Token(
    {tokenAddress: daoTokenData?.address ?? ''},
    {
      enabled: enableCensus3Token,
      refetchInterval: query =>
        query.state.data?.status.synced ? false : 5000,
    }
  );

  const isPendingDao =
    pendingDao || (isGasless && !(census3Token?.status.synced ?? false));

  const isLoading = liveDaoLoading || pendingDaoLoading || followedDaosLoading;

  const removePendingDaoMutation = useRemovePendingDaoMutation(() => {
    navigate(
      generatePath(DashboardPath, {
        network,
        dao: liveAddressOrEns,
      })
    );
    // Temporary restriction to Eth mainnet only as spamming was happening on Polygon
    //const networkInfo = CHAIN_METADATA[network];
    if (network === 'ethereum') {
      // (!networkInfo.isTestnet) {
      open('poapClaim');
    }
  });

  const followedDaoMatchPredicate = useCallback(
    (followedDao: NavigationDao) => {
      return (
        followedDao.address.toLowerCase() === liveDao?.address.toLowerCase() &&
        followedDao.chain === CHAIN_METADATA[network].id
      );
    },
    [liveDao?.address, network]
  );

  const isFollowedDao = useMemo(() => {
    if (liveDao?.address && followedDaos)
      return Boolean(followedDaos.some(followedDaoMatchPredicate));
    else return false;
  }, [followedDaoMatchPredicate, followedDaos, liveDao?.address]);

  /*************************************************
   *                    Hooks                      *
   *************************************************/
  useEffect(() => {
    // poll for the newly created DAO while waiting to be indexed
    if (isPendingDao && isSuccess && !liveDao) {
      setPollInterval(1000);
    }
  }, [isSuccess, liveDao, isPendingDao]);

  useEffect(() => {
    if (
      isPendingDao &&
      liveDao &&
      daoCreationState === DaoCreationState.ASSEMBLING_DAO &&
      (!isGasless || census3Token?.status.synced === true)
    ) {
      setPollInterval(0);
      setDaoCreationState(DaoCreationState.DAO_READY);
      setTimeout(() => setDaoCreationState(DaoCreationState.OPEN_DAO), 2000);
    }
  }, [
    liveDao,
    daoCreationState,
    isPendingDao,
    isGasless,
    census3Token?.status.synced,
  ]);

  useEffect(() => {
    if (
      pendingDaoFetched &&
      liveDaoFetched &&
      !liveDao &&
      !pendingDao &&
      !isLoading
    ) {
      navigate(NotFound, {
        replace: true,
        state: {incorrectDao: urlAddressOrEns},
      });
    }
  }, [
    liveDao,
    liveDaoFetched,
    navigate,
    pendingDao,
    pendingDaoFetched,
    urlAddressOrEns,
    isLoading,
  ]);

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

  const onCopy = useCallback(
    async (copyContent: string) => {
      await navigator.clipboard.writeText(copyContent);
      alert(t('alert.chip.inputCopied'));
    },
    [alert, t]
  );

  const handleFollowedClick = useCallback(
    async (dao: NavigationDao) => {
      if (enableFollowing) {
        try {
          if (isFollowedDao) {
            await removeFollowedDaoMutation.mutateAsync({dao});
          } else {
            await addFollowedDaoMutation.mutateAsync({dao});
          }
        } catch (error) {
          const action = isFollowedDao
            ? 'removing DAO from list of followed DAOs'
            : 'adding DAO to list of followed DAOs';

          console.error(`Error ${action}`, error);
        }
      }
    },
    [
      enableFollowing,
      isFollowedDao,
      removeFollowedDaoMutation,
      addFollowedDaoMutation,
    ]
  );

  /*************************************************
   *                    Render                     *
   *************************************************/
  if (isLoading) {
    return <Loading />;
  }

  if (isPendingDao) {
    const buttonLabel = {
      [DaoCreationState.ASSEMBLING_DAO]: t('dashboard.emptyState.buildingDAO'),
      [DaoCreationState.DAO_READY]: t('dashboard.emptyState.daoReady'),
      [DaoCreationState.OPEN_DAO]: t('dashboard.emptyState.openDao'),
    };

    const buttonIcon = {
      [DaoCreationState.ASSEMBLING_DAO]: undefined,
      [DaoCreationState.DAO_READY]: IconType.CHECKMARK,
      [DaoCreationState.OPEN_DAO]: undefined,
    };

    return (
      <Container>
        <CardEmptyState
          humanIllustration={{
            body: 'BLOCKS',
            expression: 'CASUAL',
            sunglasses: 'BIG_ROUNDED',
            hairs: 'SHORT',
          }}
          heading={t('dashboard.emptyState.title')}
          description={t('dashboard.emptyState.subtitle')}
          primaryButton={{
            label: buttonLabel[daoCreationState],
            iconLeft: buttonIcon[daoCreationState],
            onClick: handleOpenYourDaoClick,
          }}
        />
      </Container>
    );
  }

  if (liveDao && liveAddressOrEns) {
    const daoType =
      (liveDao?.plugins[0]?.id as PluginTypes) === 'multisig.plugin.dao.eth'
        ? t('explore.explorer.walletBased')
        : t('explore.explorer.tokenBased');

    const links =
      liveDao.metadata?.links
        ?.filter(link => link.name !== '' && link.url !== '')
        .map(link => ({
          label: link.name,
          href: link.url,
        })) ?? [];

    return (
      <>
        <HeaderWrapper>
          <HeaderDao
            daoName={liveDao.metadata.name}
            daoEnsName={toDisplayEns(liveDao.ensDomain)}
            daoAddress={liveDao.address}
            daoAvatar={liveDao?.metadata?.avatar}
            daoUrl={`app.aragon.org/#/daos/${network}/${liveAddressOrEns}`}
            description={liveDao.metadata.description}
            created_at={formatDate(
              liveDao.creationDate.getTime() / 1000,
              'MMMM yyyy'
            ).toString()}
            daoChain={CHAIN_METADATA[network].name}
            daoType={daoType}
            following={isFollowedDao}
            onCopy={onCopy}
            onFollowClick={() => {
              handleFollowedClick({
                address: liveDao.address.toLowerCase(),
                chain: CHAIN_METADATA[network].id,
                ensDomain: liveDao.ensDomain,
                plugins: liveDao.plugins,
                metadata: {
                  name: liveDao.metadata.name,
                  avatar: liveDao?.metadata?.avatar,
                  description: liveDao.metadata.description,
                },
              });
            }}
            links={links}
            translation={{
              follow: t('dao.follow.false'),
              following: t('dao.follow.true'),
            }}
          />
        </HeaderWrapper>

        {isDesktop ? (
          <DashboardContent
            daoAddressOrEns={liveAddressOrEns}
            pluginType={liveDao.plugins[0].id as PluginTypes}
            pluginAddress={liveDao.plugins[0].instanceAddress ?? ''}
          />
        ) : (
          <MobileDashboardContent
            daoAddressOrEns={liveAddressOrEns}
            pluginType={liveDao.plugins[0].id as PluginTypes}
            pluginAddress={liveDao.plugins[0].instanceAddress ?? ''}
          />
        )}
      </>
    );
  }

  return null;
};

const HeaderWrapper = styled.div.attrs({
  className:
    'w-screen -mx-4 md:col-span-full md:w-full md:mx-0 xl:col-start-2 xl:col-span-10 md:mt-6',
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
  const {transfers, totalAssetValue, isTokensLoading} = useDaoVault();

  const {data, isLoading} = useProposals({
    daoAddressOrEns,
    pluginType,
    pluginAddress,
  });
  const proposals = data?.pages.flat() ?? [];

  // The SDK does NOT provide a count. This will be incorrect
  // whenever the number of proposals is greater than the default
  // page size that we fetch: 6
  const proposalCount = proposals.length;
  const transactionCount = transfers.length;

  if (isTokensLoading || isLoading) {
    return <Loading />;
  }

  if (!proposalCount) {
    return (
      <>
        {!transactionCount ? (
          <EqualDivide>
            <ProposalSnapshot
              daoAddressOrEns={daoAddressOrEns}
              pluginAddress={pluginAddress}
              pluginType={pluginType}
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
  className: 'xl:space-y-10 xl:col-start-2 xl:col-span-6',
})``;

const RightNarrowContent = styled.div.attrs({
  className: 'xl:col-start-8 xl:col-span-4 xl:space-y-6',
})``;

const EqualDivide = styled.div.attrs({
  className: 'xl:col-start-2 xl:col-span-10 xl:flex xl:space-x-6',
})``;

const MembersWrapper = styled.div.attrs({
  className: 'xl:col-start-2 xl:col-span-10',
})``;

/* MOBILE DASHBOARD CONTENT ================================================= */

const MobileDashboardContent: React.FC<DashboardContentProps> = ({
  daoAddressOrEns,
  pluginType,
  pluginAddress,
}) => {
  const {transfers, totalAssetValue, isTokensLoading} = useDaoVault();

  if (isTokensLoading) {
    return <Loading />;
  }

  return (
    <MobileLayout>
      <ProposalSnapshot
        daoAddressOrEns={daoAddressOrEns}
        pluginAddress={pluginAddress}
        pluginType={pluginType}
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
  className: 'col-span-full space-y-10',
})``;
