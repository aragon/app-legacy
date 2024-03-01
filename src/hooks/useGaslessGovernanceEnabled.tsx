import {GaslessPluginName, PluginTypes} from './usePluginClient';
import {useVotingSettings} from '../services/aragon-sdk/queries/use-voting-settings';
import {GaslessPluginVotingSettings} from '@vocdoni/gasless-voting';
import {useDaoDetailsQuery} from './useDaoDetails';

export const useGaslessGovernanceEnabled = () => {
  const {data: daoDetails} = useDaoDetailsQuery();

  const pluginAddress = daoDetails?.plugins[0].instanceAddress;
  const pluginType = daoDetails?.plugins[0].id as PluginTypes;

  const {data: votingSettings} = useVotingSettings({
    pluginAddress,
    pluginType,
  });

  const isGasless = pluginType === GaslessPluginName;

  let isGovernanceEnabled = true;

  if (isGasless) {
    isGovernanceEnabled =
      (votingSettings as GaslessPluginVotingSettings)?.hasGovernanceEnabled ??
      false; // Await until loading is finished to ensure that governance is enabled
  }

  return {isGovernanceEnabled};
};
