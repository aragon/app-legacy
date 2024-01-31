import {GaselessPluginName, PluginTypes} from './usePluginClient';
import {useVotingSettings} from '../services/aragon-sdk/queries/use-voting-settings';
import {DaoDetails} from '@aragon/sdk-client';
import {GaslessPluginVotingSettings} from '@vocdoni/gasless-voting';

export const useGaslessGovernanceEnabled = (
  daoDetails?: DaoDetails | null | undefined
) => {
  const pluginType = daoDetails?.plugins[0].id as PluginTypes;
  const {data: votingSettings} = useVotingSettings({
    pluginAddress: daoDetails?.plugins[0].instanceAddress as string,
    pluginType,
  });

  const isGasless = pluginType === GaselessPluginName;
  let isGovernanceEnabled = true;

  if (isGasless) {
    isGovernanceEnabled =
      (votingSettings as GaslessPluginVotingSettings)?.hasGovernanceEnabled ??
      true;
  }

  return {isGovernanceEnabled};
};
