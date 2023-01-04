import React from 'react';

import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {
  Action,
  ActionAddAddress,
  ActionMintToken,
  ActionRemoveAddress,
  ActionsTypes,
  ActionUpdatePluginSettings,
  ActionWithdraw,
} from 'utils/types';
import {AddAddressCard} from './actions/addAddressCard';
import {MintTokenCard} from './actions/mintTokenCard';
import ModifySettingsCard from './actions/modifySettingsCard';
import {RemoveAddressCard} from './actions/removeAddressCard';
import {WithdrawCard} from './actions/withdrawCard';

type ActionsFilterProps = {
  action: Action;
  type: ActionsTypes;
};

export const ActionsFilter: React.FC<ActionsFilterProps> = ({
  action,
  type,
}: ActionsFilterProps) => {
  const {data: daoId} = useDaoParam();
  const {data: dao} = useDaoDetails(daoId);

  switch (type) {
    case 'withdraw_assets':
      return (
        <WithdrawCard
          action={action as ActionWithdraw}
          daoName={dao?.metadata?.name || ''}
        />
      );
    case 'add_address':
      return <AddAddressCard action={action as ActionAddAddress} />;
    case 'remove_address':
      return <RemoveAddressCard action={action as ActionRemoveAddress} />;
    case 'mint_tokens':
      return <MintTokenCard action={action as ActionMintToken} />;
    case 'modify_settings':
      return (
        <ModifySettingsCard action={action as ActionUpdatePluginSettings} />
      );
    default:
      return <></>;
  }
};
