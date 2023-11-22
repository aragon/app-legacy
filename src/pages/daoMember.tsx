import {ButtonText, isEnsDomain} from '@aragon/ods-old';
import {isEnsName} from '@aragon/sdk-client-common';
import React, {useCallback, useEffect, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';

import {Loading} from 'components/temporary';
import {useGlobalModalContext} from 'context/globalModals';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {PluginTypes} from 'hooks/usePluginClient';
import {featureFlags} from 'utils/featureFlags';
import {useNetwork} from 'context/network';
import {NotFound} from 'utils/paths';
import {HeaderMember, HeaderMemberStat} from 'components/headerMember';
import {useAlertContext} from 'context/alert';
import {CHAIN_METADATA} from 'utils/constants';
import {isAddress} from 'ethers/lib/utils';
import {useDaoToken} from 'hooks/useDaoToken';
import {useDelegatee} from 'services/aragon-sdk/queries/use-delegatee';
import {useWallet} from 'hooks/useWallet';
import {Address, formatUnits} from 'viem';
import {useEnsName, useEnsResolver} from 'wagmi';
import {useMember} from 'services/aragon-sdk/queries/use-member';
import {NumberFormat, formatterUtils} from '@aragon/ods';

export const DaoMember: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {open} = useGlobalModalContext();
  const {network} = useNetwork();
  const {isOnWrongNetwork, address, ensAvatarUrl} = useWallet();
  const {alert} = useAlertContext();
  const {dao, user} = useParams();

  const {data: daoDetails, isLoading: daoDetailsLoading} = useDaoDetailsQuery();
  const pluginType = daoDetails?.plugins[0].id as PluginTypes | undefined;
  const pluginAddress = daoDetails?.plugins[0].instanceAddress;

  const {data: daoToken} = useDaoToken(pluginAddress ?? '');

  const isTokenBasedDao = pluginType === 'token-voting.plugin.dao.eth';

  const {data: delegateData, isLoading: isDelegationDataLoading} = useDelegatee(
    {tokenAddress: daoToken?.address as string},
    {enabled: daoToken != null && !isOnWrongNetwork && isTokenBasedDao}
  );
  const isDelegating = !!delegateData;

  const isDelegationEnabled =
    isTokenBasedDao &&
    featureFlags.getValue('VITE_FEATURE_FLAG_DELEGATION') === 'true';

  const {data: fetchedMemberEnsName} = useEnsName({
    address: user as Address,
    chainId: CHAIN_METADATA[network].id,
    enabled: !!user && isAddress(user),
  });

  const {data: fetchedMemberAddress, isError: isErrorFetchingAddress} =
    useEnsResolver({
      name: user as string,
      chainId: CHAIN_METADATA[network].id,
      enabled: !!user && isEnsDomain(user),
    });

  const memberAddress =
    (isAddress(user || '') ? user : fetchedMemberAddress) || '';

  const memberEns =
    (isEnsDomain(user || '') ? user : fetchedMemberEnsName) || '';

  /** @todo implement once clarity is in */
  const memberDescription = '';

  const isUserOwnProfile =
    memberAddress?.toLowerCase() === address?.toLowerCase();

  const explorerUrl =
    CHAIN_METADATA[network].explorer + 'address/' + memberAddress;

  const explorerName = CHAIN_METADATA[network].explorerName;

  const {data: daoMember} = useMember(
    {
      address: memberAddress,
      pluginAddress: pluginAddress || '',
    },
    {enabled: !!memberAddress && !!daoDetails}
  );

  const stats = useMemo<HeaderMemberStat[]>(() => {
    if (!daoToken || !daoMember) return [];

    const memberVotingPower = formatUnits(
      daoMember?.votingPower ?? 0n,
      daoToken.decimals
    );
    const memberTokenBalance = formatUnits(
      daoMember?.balance ?? 0n,
      daoToken.decimals
    );
    const memberDelegations = daoMember?.delegators?.length || 0;

    if (!isTokenBasedDao) {
      return [
        {
          value: formatterUtils.formatNumber(memberVotingPower, {
            format: NumberFormat.TOKEN_AMOUNT_SHORT,
          }),
          description: 'Voting power',
          helpText: daoToken.symbol,
        },
        {
          value: 'TBD',
          helpText: 'days ago',
          description: 'Latest activity',
        },
      ];
    }

    return [
      {
        value: formatterUtils.formatNumber(memberVotingPower, {
          format: NumberFormat.TOKEN_AMOUNT_SHORT,
        }),
        description: 'Voting power',
        helpText: daoToken.symbol,
      },
      {
        value: formatterUtils.formatNumber(memberTokenBalance, {
          format: NumberFormat.TOKEN_AMOUNT_SHORT,
        }),
        description: 'Token Balance',
        helpText: daoToken.symbol,
      },
      {
        value: memberDelegations,
        description: 'Delegations received',
      },
      {
        value: 'TBD',
        helpText: 'days ago',
        description: 'Latest activity',
      },
    ];
  }, [daoMember, daoToken, isTokenBasedDao]);

  const isPageLoading =
    daoDetailsLoading ||
    !memberAddress ||
    (isDelegationEnabled && isDelegationDataLoading);

  /*************************************************
   *                    Handlers                   *
   *************************************************/

  const onCopy = useCallback(
    async (copyContent: string) => {
      await navigator.clipboard.writeText(copyContent);
      alert(t('alert.chip.inputCopied'));
    },
    [alert, t]
  );

  /*************************************************
   *                    Hooks                      *
   *************************************************/

  useEffect(() => {
    if (
      user &&
      !isEnsName(user) &&
      (!isAddress(user) || isErrorFetchingAddress)
    ) {
      navigate(NotFound, {replace: true});
    }
  }, [isErrorFetchingAddress, navigate, user]);

  /*************************************************
   *                    Render                     *
   *************************************************/
  if (isPageLoading) {
    return <Loading />;
  }

  return (
    <HeaderWrapper>
      <HeaderMember
        ens={memberEns}
        address={memberAddress}
        profileUrl={`app.aragon.org/#/daos/${network}/${dao}/members/${user}`}
        explorerUrl={explorerUrl}
        explorerName={explorerName}
        avatarUrl={ensAvatarUrl}
        description={memberDescription}
        onCopy={onCopy}
        stats={stats}
        actions={
          isDelegationEnabled &&
          !isUserOwnProfile && (
            <ButtonText
              label={isDelegating ? 'Change delegation' : 'Delegate to'}
              mode="primary"
              onClick={() => open('delegateVoting', {delegate: memberAddress})}
            />
          )
        }
      />
    </HeaderWrapper>
  );
};

const HeaderWrapper = styled.div.attrs({
  className:
    'w-screen -mx-4 md:col-span-full md:w-full md:mx-0 xl:col-start-2 xl:col-span-10 md:mt-6',
})``;
