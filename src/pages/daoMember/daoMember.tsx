import {isEnsDomain} from '@aragon/ods-old';
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
import {useMember, useMemberDAOs} from 'services/aragon-sdk/queries/use-member';
import {Button, NumberFormat, formatterUtils} from '@aragon/ods';
import {TokenVotingMember} from '@aragon/sdk-client';
import {useCreatorProposals} from 'services/aragon-sdk/queries/use-creator-proposals';
import {UserProposalList} from 'components/userProposalList';
import {MembershipDAOList} from 'components/membershipDAOList/membershipDAOList';

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

  const isUserOwnProfile =
    memberAddress?.toLowerCase() === address?.toLowerCase();

  const explorerUrl =
    CHAIN_METADATA[network].explorer + 'address/' + memberAddress;

  const explorerName = CHAIN_METADATA[network].explorerName;

  const {data: daoMember, isLoading: isMemberDataLoading} = useMember(
    {
      address: memberAddress,
      pluginAddress: pluginAddress as string,
    },
    {enabled: memberAddress != null && pluginAddress != null}
  );

  const {
    data: memberCreatedProposals = [],
    isLoading: isMemberCreatedProposalsLoading,
  } = useCreatorProposals(
    {
      address: memberAddress,
      pluginAddress: pluginAddress as string,
      pluginType,
    },
    {enabled: !!memberAddress && !!daoDetails && !!pluginAddress}
  );

  const {data: daoMemberList} = useMemberDAOs(
    {
      address: memberAddress?.toLowerCase(),
      pluginType: pluginType,
      daoAddress: daoDetails?.address,
    },
    {enabled: !!memberAddress && !!daoDetails}
  );

  const isDelegating = !!(daoMember as TokenVotingMember)?.delegators?.find(
    item => item.address.toLowerCase() === address?.toLowerCase()
  );

  const isDelegationEnabled =
    isConnected &&
    !isUserOwnProfile &&
    isTokenBasedDao &&
    featureFlags.getValue('VITE_FEATURE_FLAG_DELEGATION') === 'true';

  const stats = useMemo<HeaderMemberStat[]>(() => {
    if (!isTokenBasedDao) {
      return [
        {
          value: memberCreatedProposals.length,
          description: t('members.profile.labelProposalCreated'),
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
        helpText: daoToken.symbol,
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
    ];
  }, [
    daoMember?.balance,
    daoMember?.delegators?.length,
    daoMember?.votingPower,
    daoToken,
    isTokenBasedDao,
    memberCreatedProposals?.length,
    t,
  ]);

  const isPageLoading =
    daoDetailsLoading ||
    !memberAddress ||
    isMemberCreatedProposalsLoading ||
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
        onCopy={onCopy}
        stats={stats}
        actions={
          isDelegationEnabled && (
            <Button
              variant="primary"
              size="md"
              onClick={() => open('delegateVoting', {delegate: memberAddress})}
            >
              {isDelegating
                ? t('members.profile.headerCTAchangeDelegation')
                : t('members.profile.headerCTAdelegateTo')}
            </Button>
          )
        }
      />
      <div className="flex flex-col gap-16 px-4 md:flex-row md:px-0">
        <div className="flex grow flex-col gap-10">
          <UserProposalList proposals={memberCreatedProposals} />
        </div>
        <div className="flex w-full grow flex-col md:max-w-[400px]">
          <MembershipDAOList
            daos={daoMemberList}
            memberAddress={memberAddress}
          />
        </div>
      </div>
    </HeaderWrapper>
  );
};

const HeaderWrapper = styled.div.attrs({
  className:
    'w-screen -mx-4 md:col-span-full md:w-full md:mx-0 xl:col-start-2 xl:col-span-10 md:mt-6',
})``;
