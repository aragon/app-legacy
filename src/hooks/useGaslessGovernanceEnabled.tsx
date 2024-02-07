import {GaselessPluginName, PluginTypes} from './usePluginClient';
import {useVotingSettings} from '../services/aragon-sdk/queries/use-voting-settings';
import {DaoDetails} from '@aragon/sdk-client';
import {GaslessPluginVotingSettings} from '@vocdoni/gasless-voting';

export const useGaslessGovernanceEnabled = ({
  pluginType,
  pluginAddress,
  daoDetails,
}: {
  pluginType?: PluginTypes;
  pluginAddress?: string;
  daoDetails?: DaoDetails | null | undefined;
}) => {
  const pType =
    pluginType ?? (daoDetails?.plugins[0].id as PluginTypes) ?? null;
  const pAddress =
    pluginAddress ?? (daoDetails?.plugins[0].instanceAddress as string) ?? null;
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
