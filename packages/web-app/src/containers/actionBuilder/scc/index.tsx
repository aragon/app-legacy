import {ListItemAction} from '@aragon/ui-components';
import React from 'react';
import {useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {AccordionMethod} from 'components/accordionMethod';
import {useActionsContext} from 'context/actions';
import {ActionIndex, Input} from 'utils/types';
import {FormItem} from '../addAddresses';
import {useAlertContext} from 'context/alert';
import {ComponentForType} from 'containers/smartContractComposer/components/inputForm';

const SCCAction: React.FC<ActionIndex> = ({actionIndex}) => {
  const {t} = useTranslation();
  const {removeAction} = useActionsContext();
  const [actionData] = useWatch({
    name: [`actions.${actionIndex}`],
  });
  const {alert} = useAlertContext();

  const methodActions = [
    {
      component: (
        <ListItemAction title={t('labels.removeEntireAction')} bgWhite />
      ),
      callback: () => {
        removeAction(actionIndex);
        alert(t('alert.chip.removedAction'));
      },
    },
  ];

  return (
    <AccordionMethod
      type="action-builder"
      methodName={actionData.functionName}
      dropdownItems={methodActions}
      smartContractName={actionData.contractName}
      // TODO: How should we add verified badge? (Etherscan/Sourcify verification status)?
      verified
      // methodDescription={t('AddActionModal.withdrawAssetsActionSubtitle')}
    >
      <FormItem className="space-y-3 rounded-b-xl">
        {actionData.inputs?.length > 0 ? (
          <div className="space-y-2">
            {(actionData.inputs as Input[]).map((input, index) => (
              <div key={input.name}>
                <div className="mb-1.5 text-base font-bold text-ui-800 capitalize">
                  {input.name}
                  <span className="ml-0.5 text-sm normal-case">
                    ({input.type})
                  </span>
                </div>
                <ComponentForType
                  key={input.name}
                  input={input}
                  functionName={actionData.name}
                  formHandleName={`actions.${actionIndex}.inputs.${index}.value`}
                />
              </div>
            ))}
          </div>
        ) : null}
      </FormItem>
    </AccordionMethod>
  );
};

export default SCCAction;
