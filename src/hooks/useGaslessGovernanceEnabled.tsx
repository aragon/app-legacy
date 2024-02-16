import {GaselessPluginName, PluginTypes} from './usePluginClient';
import {useVotingSettings} from '../services/aragon-sdk/queries/use-voting-settings';
import {GaslessPluginVotingSettings} from '@vocdoni/gasless-voting';

export const useGaslessGovernanceEnabled = ({
  pluginType,
  pluginAddress,
}: {
  pluginType?: PluginTypes;
  pluginAddress?: string;
}) => {
  const {data: votingSettings} = useVotingSettings({
    pluginAddress: pluginAddress,
    pluginType: pluginType,
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
