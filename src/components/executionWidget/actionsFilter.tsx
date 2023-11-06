import React from 'react';

import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {Action, ExecutionStatus} from 'utils/types';
import {AddAddressCard} from './actions/addAddressCard';
import {MintTokenCard} from './actions/mintTokenCard';
import {ModifyMetadataCard} from './actions/modifyMetadataCard';
import {ModifyMultisigSettingsCard} from './actions/modifyMultisigSettingsCard';
import {ModifyMvSettingsCard} from './actions/modifySettingsCard';
import {RemoveAddressCard} from './actions/removeAddressCard';
import {SCCExecutionCard} from './actions/sccExecutionWidget';
import {WCActionCard} from './actions/walletConnectActionCard';
import {WithdrawCard} from './actions/withdrawCard';
import {UpdateOSCard} from './actions/updateOScard';

type ActionsFilterProps = {
  action: Action;
  status: ExecutionStatus | undefined;
};

export const ActionsFilter: React.FC<ActionsFilterProps> = ({
  action,
  status,
}) => {
  const {data: dao} = useDaoDetailsQuery();

  // all actions have names
  switch (action.name) {
    case 'withdraw_assets':
      return (
        <WithdrawCard action={action} daoName={dao?.metadata?.name || ''} />
      );
    case 'add_address':
      return <AddAddressCard action={action} />;
    case 'remove_address':
      return <RemoveAddressCard action={action} />;
    case 'mint_tokens':
      return <MintTokenCard action={action} />;
    case 'modify_metadata':
      return <ModifyMetadataCard action={action} />;
    case 'modify_token_voting_settings':
      return <ModifyMvSettingsCard action={action} />;
    case 'modify_multisig_voting_settings':
      return <ModifyMultisigSettingsCard action={action} />;
    case 'external_contract_action':
      return <SCCExecutionCard action={action} />;
    case 'wallet_connect_action':
      return (
        <WCActionCard action={action} type="execution-widget" status={status} />
      );
    case 'os_update':
      return <UpdateOSCard action={action} dao={dao} />;
    default:
      return <></>;
  }
};
