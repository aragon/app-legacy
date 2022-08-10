import React from 'react';
import {ListItemAction} from '@aragon/ui-components';
import {useTranslation} from 'react-i18next';
import {useFormContext} from 'react-hook-form';

import {FormItem} from '../addAddresses';
import {AccordionMethod} from 'components/accordionMethod';
import {useActionsContext} from 'context/actions';
import ConfigureWithdrawForm from 'containers/configureWithdraw';

type Props = {
  index: number;
};

const WithdrawAction: React.FC<Props> = ({index: actionIndex}) => {
  const {t} = useTranslation();
  const {setValue, clearErrors} = useFormContext();
  const {removeAction, duplicateAction, setActionsCounter} =
    useActionsContext();

  const resetWithdrawFields = () => {
    clearErrors(`actions.${actionIndex}`);
    setValue(`actions.${actionIndex}`, {
      to: '',
      amount: '',
      tokenAddress: '',
      tokenSymbol: '',
    });
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
      callback: () => removeAction(actionIndex),
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
        <ConfigureWithdrawForm
          index={actionIndex}
          setActionsCounter={setActionsCounter}
        />
      </FormItem>
    </AccordionMethod>
  );
};

export default WithdrawAction;
