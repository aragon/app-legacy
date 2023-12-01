import {MajorityVotingSettings, TokenVotingClient} from '@aragon/sdk-client';
import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {GaslessVotingClient} from '@vocdoni/gasless-voting';

import {useNetwork} from 'context/network';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import {invariant} from 'utils/invariant';
import {IFetchIsMemberParams} from '../aragon-sdk-service.api';
import {aragonSdkQueryKeys} from '../query-keys';
import {useVotingSettings} from './use-voting-settings';
import {TokenDaoMember, useDaoMembers} from 'hooks/useDaoMembers';
import {fetchBalance} from 'utils/tokens';
import {useVotingPowerAsync} from './use-voting-power';
import {formatUnits} from 'utils/library';
import {useCallback} from 'react';
import {CHAIN_METADATA} from 'utils/constants';
import {useProviders} from 'context/providers';

interface IUseIsMemberParams extends IFetchIsMemberParams {
  pluginType: PluginTypes;
}

export const useIsMember = (
  params: IUseIsMemberParams,
  options: UseQueryOptions<boolean | undefined> = {}
) => {
  const {network} = useNetwork();
  const client = usePluginClient(params.pluginType);
  const {api: provider} = useProviders();
  const fetchVotingPower = useVotingPowerAsync();
  const {data: votingSettings, isLoading: settingsAreLoading} =
    useVotingSettings({
      pluginAddress: params.pluginAddress,
      pluginType: params.pluginType,
    });
  const {
    data: {daoToken, filteredMembers},
    isLoading: membersAreLoading,
  } = useDaoMembers(params.pluginAddress, params.pluginType, {
    searchTerm: params.address as string,
    page: 0,
  });

  if (
    client == null ||
    !params.address ||
    !params.pluginAddress ||
    client instanceof GaslessVotingClient ||
    daoToken == null ||
    membersAreLoading ||
    settingsAreLoading
  ) {
    options.enabled = false;
  }

  const fetchIsMemberTokenBased = useCallback(async () => {
    const connectedDaoMember = filteredMembers[0] as TokenDaoMember | undefined;
    let balance = connectedDaoMember?.balance ?? 0;
    let votingPower = connectedDaoMember?.votingPower ?? 0;

    // Fallback to fetching connected user balance and voting power from smart
    // contract when user is not found on DAO members list
    if (connectedDaoMember == null) {
      const userBalance = await fetchBalance(
        daoToken!.address,
        params.address,
        provider,
        CHAIN_METADATA[network].nativeCurrency
      );
      balance = Number(userBalance);

      const userVotingPower = await fetchVotingPower({
        address: params.address,
        tokenAddress: daoToken!.address,
      });
      votingPower = Number(formatUnits(userVotingPower, daoToken!.decimals));
    }

    const minProposalThreshold = Number(
      formatUnits(
        (votingSettings as MajorityVotingSettings)?.minProposerVotingPower ?? 0,
        daoToken!.decimals
      )
    );

    const isMember =
      minProposalThreshold === 0 ||
      balance >= minProposalThreshold ||
      votingPower >= minProposalThreshold;

    return isMember;
  }, [
    daoToken,
    fetchVotingPower,
    filteredMembers,
    network,
    params.address,
    provider,
    votingSettings,
  ]);

  const fetchIsMember = async () => {
    invariant(client != null, 'fetchIsMember: client is not defined');

    if (client instanceof GaslessVotingClient) {
      console.warn(
        'fetchIsMember: unable to determine membership using GaslessVotingClient'
      );
      return;
    }

    const data =
      client instanceof TokenVotingClient
        ? await fetchIsMemberTokenBased()
        : await client.methods.isMember({
            address: params.address,
            pluginAddress: params.pluginAddress,
          });

    return data;
  };

  const queryParams: IFetchIsMemberParams = {
    pluginAddress: params.pluginAddress,
    address: params.address,
  };

  return useQuery(
    aragonSdkQueryKeys.isMember(
      {
        network,
        address: params.address,
      },
      queryParams
    ),
    () => fetchIsMember(),
    options
  );
};
