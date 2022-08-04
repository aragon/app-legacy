import React from 'react';

import {useDaoMetadata} from 'hooks/useDaoMetadata';
import {useDaoParam} from 'hooks/useDaoParam';
import {Action, ActionsTypes, ActionWithdraw} from 'utils/types';
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
    default:
      return <></>;
  }
};
