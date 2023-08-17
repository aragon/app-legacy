import {ListItemAction} from '@aragon/ods';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {WCActionCard} from 'components/executionWidget/actions/walletConnectActionCard';
import {useActionsContext} from 'context/actions';
import {useAlertContext} from 'context/alert';
import {ActionIndex} from 'utils/types';

const WalletConnectAction: React.FC<ActionIndex & {allowRemove?: boolean}> = ({
  actionIndex,
  allowRemove = true,
}) => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const {watch} = useFormContext();

  const actionData = watch(`actions.${actionIndex}`);
  const {removeAction} = useActionsContext();

  const methodActions = (() => {
    const result = [];

    if (allowRemove) {
      result.push({
        component: (
          <ListItemAction title={t('labels.removeEntireAction')} bgWhite />
        ),
        callback: () => {
          removeAction(actionIndex);
          alert(t('alert.chip.removedAction'));
        },
      });
    }

    return result;
  })();

  if (actionData) {
    return (
      <>
        <WCActionCard
          status="default"
          type="action-builder"
          action={actionData}
          methodActions={methodActions}
        />
      </>
    );
  }

  return null;
};

export default WalletConnectAction;
