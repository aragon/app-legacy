import React from 'react';
import {useFormContext} from 'react-hook-form';

import {TemporarySection} from 'components/temporary';
import TokenMenu from 'containers/tokenMenu';
import {useActionsContext} from 'context/actions';
import {useNetwork} from 'context/network';
import {useDaoBalances} from 'hooks/useDaoBalances';
import {useDaoParam} from 'hooks/useDaoParam';
import {fetchTokenPrice} from 'services/prices';
import {formatUnits} from 'utils/library';
import {
  ActionIndex,
  ActionItem,
  ActionsTypes,
  BaseTokenInfo,
} from 'utils/types';
import AddAddresses from './addAddresses';
import MintTokens from './mintTokens';
import RemoveAddresses from './removeAddresses';
import WithdrawAction from './withdraw/withdrawAction';
import UpdateMinimumApproval from './updateMinimumApproval';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {usePluginSettings} from 'hooks/usePluginSettings';
import {PluginTypes} from 'hooks/usePluginClient';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {MultisigVotingSettings} from '@aragon/sdk-client';

/**
 * This Component is responsible for generating all actions that append to pipeline context (actions)
 * In future we can add more action template like: mint token Component
 * or custom action component (for smart contracts methods)
 * @returns List of actions
 */

type ActionsComponentProps = {
  name: ActionsTypes;
} & ActionIndex;

const Action: React.FC<ActionsComponentProps> = ({name, actionIndex}) => {
  // TODO: *** Should be in a global context ***
  // dao data
  const {data: dao} = useDaoParam();
  const {data: daoDetails} = useDaoDetails(dao);

  // plugin data
  const {data: votingSettings} = usePluginSettings(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes
  );
  const {data: daoMembers} = useDaoMembers(
    daoDetails?.plugins?.[0]?.instanceAddress || '',
    (daoDetails?.plugins?.[0]?.id as PluginTypes) || undefined
  );
  const multisigDAOSettings = votingSettings as MultisigVotingSettings;

  // *** end of TODO ***

  switch (name) {
    case 'withdraw_assets':
      return <WithdrawAction {...{actionIndex}} />;
    case 'mint_tokens':
      return <MintTokens {...{actionIndex}} />;
    case 'external_contract':
      return (
        <TemporarySection purpose="It serves as a placeholder for not yet implemented external contract interaction component" />
      );
    case 'modify_token_voting_settings':
      return (
        <TemporarySection purpose="It serves as a placeholder for not yet implemented external contract interaction component" />
      );
    case 'add_address':
      return (
        <AddAddresses
          actionIndex={actionIndex}
          currentDaoMembers={daoMembers?.members}
        />
      );
    case 'remove_address':
      return (
        <RemoveAddresses
          actionIndex={actionIndex}
          currentDaoMembers={daoMembers?.members}
        />
      );
    case 'modify_multisig_voting_settings':
      return (
        <UpdateMinimumApproval
          actionIndex={actionIndex}
          currentDaoMembers={daoMembers?.members}
          currentMinimumApproval={multisigDAOSettings?.minApprovals}
        />
      );
    default:
      throw Error('Action not found');
  }
};

const ActionBuilder: React.FC = () => {
  const {data: daoAddress} = useDaoParam();
  const {network} = useNetwork();
  const {selectedActionIndex: index, actions} = useActionsContext();
  const {data: tokens} = useDaoBalances(daoAddress);
  const {setValue, resetField, clearErrors} = useFormContext();

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/

  const handleTokenSelect = (token: BaseTokenInfo) => {
    setValue(`actions.${index}.tokenSymbol`, token.symbol);

    if (token.address === '') {
      setValue(`actions.${index}.isCustomToken`, true);
      resetField(`actions.${index}.tokenName`);
      resetField(`actions.${index}.tokenImgUrl`);
      resetField(`actions.${index}.tokenAddress`);
      resetField(`actions.${index}.tokenBalance`);
      clearErrors(`actions.${index}.amount`);
      return;
    }

    clearErrors([
      `actions.${index}.tokenAddress`,
      `actions.${index}.tokenSymbol`,
    ]);
    setValue(`actions.${index}.isCustomToken`, false);
    setValue(`actions.${index}.tokenName`, token.name);
    setValue(`actions.${index}.tokenImgUrl`, token.imgUrl);
    setValue(`actions.${index}.tokenAddress`, token.address);
    setValue(
      `actions.${index}.tokenBalance`,
      formatUnits(token.count, token.decimals)
    );

    fetchTokenPrice(token.address, network).then(price => {
      setValue(`actions.${index}.tokenPrice`, price);
    });
  };

  return (
    <>
      {actions?.map((action: ActionItem, index: number) => (
        <Action key={index} name={action?.name} actionIndex={index} />
      ))}

      <TokenMenu
        isWallet={false}
        onTokenSelect={handleTokenSelect}
        tokenBalances={tokens || []}
      />
    </>
  );
};

export default ActionBuilder;
