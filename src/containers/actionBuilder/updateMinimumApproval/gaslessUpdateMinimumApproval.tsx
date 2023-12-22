import React, {useEffect} from 'react';

import {ActionUpdateGaslessSettings} from 'utils/types';
import UpdateMinimumApproval, {UpdateMinimumApprovalProps} from './index';
import {GaslessPluginVotingSettings} from '@vocdoni/gasless-voting';
import {useDaoToken} from '../../../hooks/useDaoToken';
import {useTokenSupply} from '../../../hooks/useTokenSupply';
import {useFormContext} from 'react-hook-form';

type GaslessUpdateMinimumApprovalProps = UpdateMinimumApprovalProps & {
  gaslessSettings: GaslessPluginVotingSettings;
  pluginAddress: string;
};

/**
 * This is basically a wrapper for `UpdateMinimumApproval` that adds the default gassless action values
 * For the original UpdateMinimumApproval, the modify majority settings action is more simple that the
 * gassless settings one, so we need to add the default values for the gassless settings
 */
export const GaslessUpdateMinimumApproval: React.FC<
  GaslessUpdateMinimumApprovalProps
> = ({gaslessSettings, pluginAddress, actionIndex, ...rest}) => {
  const {data: daoToken, isLoading: daoTokenLoading} =
    useDaoToken(pluginAddress);
  const {data: tokenSupply, isLoading: tokenSupplyIsLoading} = useTokenSupply(
    daoToken?.address || ''
  );

  const {setValue} = useFormContext();

  useEffect(() => {
    if (tokenSupplyIsLoading || daoTokenLoading) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {minTallyApprovals, ...rest} = gaslessSettings; // Do not update the
    const gaslessSettingsAction: ActionUpdateGaslessSettings = {
      name: 'modify_gasless_voting_settings',
      inputs: {
        token: daoToken,
        totalVotingWeight: tokenSupply?.raw || BigInt(0),
        ...gaslessSettings,
      },
    };

    setValue(`actions.${actionIndex}`, gaslessSettingsAction);
  }, [
    actionIndex,
    daoToken,
    daoTokenLoading,
    gaslessSettings,
    setValue,
    tokenSupply?.raw,
    tokenSupplyIsLoading,
  ]);

  return (
    <UpdateMinimumApproval
      isGasless={true}
      actionIndex={actionIndex}
      {...rest}
    />
  );
};
