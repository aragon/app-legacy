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
  const pType = pluginType;
  const pAddress = pluginAddress;
  const {data: votingSettings} = useVotingSettings({
    pluginAddress: pAddress,
    pluginType: pType,
  });

  const isGasless = pType === GaselessPluginName;
  let isGovernanceEnabled = true;

  if (isGasless) {
    isGovernanceEnabled =
      (votingSettings as GaslessPluginVotingSettings)?.hasGovernanceEnabled ??
      true;
  }

  return {isGovernanceEnabled};
};
