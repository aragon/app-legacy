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
import {useWallet} from 'hooks/useWallet';
import {Address, formatUnits} from 'viem';
import {useEnsAvatar, useEnsName, useEnsResolver} from 'wagmi';
import {useMember} from 'services/aragon-sdk/queries/use-member';
import {NumberFormat, formatterUtils} from '@aragon/ods';

export const DaoMember: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {open} = useGlobalModalContext();
  const {network} = useNetwork();
  const {address, isConnected} = useWallet();
  const {alert} = useAlertContext();
  const {dao, user} = useParams();

  const {data: daoDetails, isLoading: daoDetailsLoading} = useDaoDetailsQuery();
  const pluginType = daoDetails?.plugins[0].id as PluginTypes | undefined;
  const pluginAddress = daoDetails?.plugins[0].instanceAddress;

  const {data: daoToken} = useDaoToken(pluginAddress ?? '');

  const isTokenBasedDao = pluginType === 'token-voting.plugin.dao.eth';

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

  const {data: ensAvatar} = useEnsAvatar({
    name: fetchedMemberEnsName || user,
    enabled: !!fetchedMemberEnsName || (!!user && isEnsDomain(user)),
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

  const {data: daoMember, isLoading: isMemberDataLoading} = useMember(
    {
      address: memberAddress,
      pluginAddress: pluginAddress || '',
    },
    {enabled: !!memberAddress && !!daoDetails}
  );

  const isDelegating = !!daoMember?.delegators?.find(
    item => item.address === address
  );

  const isDelegationEnabled =
    isConnected &&
    !isUserOwnProfile &&
    isTokenBasedDao &&
    featureFlags.getValue('VITE_FEATURE_FLAG_DELEGATION') === 'true';

  const stats = useMemo<HeaderMemberStat[]>(() => {
    /** @todo implement this stat */
    const lastActivityDays = undefined;

    /** @todo implement this stat */
    const totalProposalsCreated = 0;

    if (!isTokenBasedDao) {
      return [
        {
          value: totalProposalsCreated,
          description: t('members.profile.labelProposalCreated'),
        },
        {
          value: '-',
          helpText: t('members.profile.labelDaysAgo'),
          description: t('members.profile.labelLatestActivity'),
        },
      ];
    }

    if (!daoToken) return [];

    const memberVotingPower = formatUnits(
      daoMember?.votingPower ?? 0n,
      daoToken.decimals
    );

    const memberTokenBalance = formatUnits(
      daoMember?.balance ?? 0n,
      daoToken.decimals
    );

    const memberDelegations = daoMember?.delegators?.length || 0;

    return [
      {
        value: formatterUtils.formatNumber(memberVotingPower, {
          format: NumberFormat.TOKEN_AMOUNT_SHORT,
        }),
        description: t('members.profile.labelVotingPower'),
        helpText: lastActivityDays ? daoToken.symbol : undefined,
      },
      {
        value: formatterUtils.formatNumber(memberTokenBalance, {
          format: NumberFormat.TOKEN_AMOUNT_SHORT,
        }),
        description: t('members.profile.labelTokenBalance'),
        helpText: daoToken.symbol,
      },
      {
        value: memberDelegations,
        description: t('members.profile.labelDelegationsReceived'),
      },
      {
        value: lastActivityDays || '-',
        helpText: lastActivityDays
          ? t('members.profile.labelDaysAgo')
          : undefined,
        description: t('members.profile.labelLatestActivity'),
      },
    ];
  }, [daoMember, daoToken, isTokenBasedDao, t]);

  const isPageLoading =
    daoDetailsLoading ||
    !memberAddress ||
    (isDelegationEnabled && isMemberDataLoading);

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
        avatarUrl={ensAvatar}
        description={memberDescription}
        onCopy={onCopy}
        stats={stats}
        actions={
          isDelegationEnabled && (
            <ButtonText
              label={
                isDelegating
                  ? t('members.profile.headerCTAchangeDelegation')
                  : t('members.profile.headerCTAdelegateTo')
              }
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
