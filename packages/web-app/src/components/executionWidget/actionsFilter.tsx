import React from 'react';

import {useDaoMetadata} from 'hooks/useDaoMetadata';
import {useDaoParam} from 'hooks/useDaoParam';
import {
  Action,
  ActionsTypes,
  ActionWithdraw,
  ActionAddAddress,
  ActionMintToken,
} from 'utils/types';
import {WithdrawCard} from './actions/withdrawCard';
import {AddAddressCard} from './actions/addAddressCard';
import {RemoveAddressCard} from './actions/removeAddressCard';
import {MintTokenCard} from './actions/mintTokenCard';

type ActionsFilterProps = {
  action: Action;
  type: ActionsTypes;
};

export const ActionsFilter: React.FC<ActionsFilterProps> = ({
  action,
  type,
}: ActionsFilterProps) => {
  const {data: daoId} = useDaoParam();
  const {data: dao} = useDaoMetadata(daoId);

  switch (type) {
    case 'withdraw_assets':
      return (
        <>
          <WithdrawCard
            action={action as ActionWithdraw}
            daoName={dao?.name || ''}
          />
        </>
      );
    case 'add_address':
      return (
        <>
          <AddAddressCard action={action as ActionAddAddress} />
        </>
      );
    case 'remove_address':
      return (
        <>
          <RemoveAddressCard action={action as ActionAddAddress} />
        </>
      );
    case 'mint_tokens':
      return (
        <>
          <MintTokenCard action={action as ActionMintToken} />
        </>
      );
    default:
      return <></>;
  }
};
