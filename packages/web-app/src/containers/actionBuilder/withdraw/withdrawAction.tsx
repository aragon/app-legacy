import {ListItemAction} from '@aragon/ui-components';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {AccordionMethod} from 'components/accordionMethod';
import ConfigureWithdrawForm from 'containers/configureWithdraw';
import {useActionsContext} from 'context/actions';
import {ActionIndex} from 'utils/types';
import {FormItem} from '../addAddresses';

type WithdrawActionProps = ActionIndex;

const WithdrawAction: React.FC<WithdrawActionProps> = ({actionIndex}) => {
  const {t} = useTranslation();
  const {removeAction, duplicateAction} = useActionsContext();
  const {setValue, clearErrors, resetField} = useFormContext();

  const resetWithdrawFields = () => {
    clearErrors(`actions.${actionIndex}`);
    resetField(`actions.${actionIndex}`);
    setValue(`actions.${actionIndex}`, {
      to: '',
      amount: '',
      tokenAddress: '',
      tokenSymbol: '',
    });
  };

  const removeWithdrawFields = (actionIndex: number) => {
    removeAction(actionIndex);
  };

  const methodActions = [
    {
      component: <ListItemAction title={t('labels.duplicateAction')} bgWhite />,
      callback: () => duplicateAction(actionIndex),
    },
    {
      component: <ListItemAction title={t('labels.resetAction')} bgWhite />,
      callback: resetWithdrawFields,
    },
    {
      component: (
        <ListItemAction title={t('labels.removeEntireAction')} bgWhite />
      ),
      callback: () => removeWithdrawFields(actionIndex),
    },
  ];

  return (
    <AccordionMethod
      verified
      type="action-builder"
      methodName={t('AddActionModal.withdrawAssets')}
      dropdownItems={methodActions}
      smartContractName={t('labels.aragonCore')}
      methodDescription={t('AddActionModal.withdrawAssetsActionSubtitle')}
    >
      <FormItem className="py-3 space-y-3 rounded-b-xl">
        <ConfigureWithdrawForm actionIndex={actionIndex} />
      </FormItem>
    </AccordionMethod>
  );
};

export default WithdrawAction;
