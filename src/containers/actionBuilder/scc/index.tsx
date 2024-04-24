import React, {useEffect, useState} from 'react';
import {useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {AlertInline, Dropdown} from '@aragon/ods';

import {AccordionMethod} from 'components/accordionMethod';
import {useActionsContext} from 'context/actions';
import {ActionIndex, Input} from 'utils/types';
import {FormItem} from '../addAddresses';
import {useAlertContext} from 'context/alert';
import {ComponentForType} from 'containers/smartContractComposer/components/inputForm';
import {useNetwork} from 'context/network';
import {validateSCCAction} from 'utils/validators';
import {CHAIN_METADATA} from 'utils/constants';

const SCCAction: React.FC<ActionIndex & {allowRemove?: boolean}> = ({
  actionIndex,
  allowRemove = true,
}) => {
  const {t} = useTranslation();
  const {removeAction} = useActionsContext();
  const actionData = useWatch({
    name: `actions.${actionIndex}`,
  });
  const {alert} = useAlertContext();
  const {network} = useNetwork();
  const [isValid, setIsValid] = useState(true);

  console.log('ciewvew', actionData);

  useEffect(() => {
    const validateAction = async () => {
      const isValid = await validateSCCAction(actionData, network);
      setIsValid(isValid);
    };
    validateAction();
  }, [actionData, network]);

  const methodActions = (() => {
    const result = [];

    if (allowRemove) {
      result.push(
        <Dropdown.Item
          onClick={() => {
            removeAction(actionIndex);
            alert(t('alert.chip.removedAction'));
          }}
          key={0}
        >
          {t('labels.removeEntireAction')}
        </Dropdown.Item>
      );
    }

    return result;
  })();

  if (actionData) {
    const actionHasInputs = actionData.inputs && actionData.inputs.length > 0;

    return (
      <AccordionMethod
        type="action-builder"
        methodName={actionData.functionName}
        dropdownItems={methodActions}
        smartContractName={actionData.contractName}
        smartContractAddress={actionData.contractAddress}
        blockExplorerLink={
          actionData.contractAddress
            ? `${CHAIN_METADATA[network].explorer}address/${actionData.contractAddress}`
            : undefined
        }
        // TODO: How should we add verified badge? (Etherscan/Sourcify verification status)?
        verified
        methodDescription={actionData.notice}
        emptyItem={!actionHasInputs}
      >
        {actionHasInputs && (
          <FormItem className="space-y-6 rounded-b-xl">
            <div className="space-y-4 pb-3">
              {(actionData.inputs as Input[])
                .filter(input => input.type)
                .map((input, index) => (
                  <div key={input.name}>
                    <div className="text-base font-semibold capitalize leading-normal text-neutral-800">
                      {input.name}
                      <span className="ml-1 text-sm normal-case leading-normal">
                        ({input.type})
                      </span>
                    </div>
                    <div className="mb-3 mt-1">
                      <span className="text-neutral-600 ft-text-sm">
                        {input.notice}
                      </span>
                    </div>
                    <ComponentForType
                      key={input.name}
                      input={input}
                      functionName={actionData.name}
                      formHandleName={`actions.${actionIndex}.inputs.${index}.value`}
                      isValid={isValid}
                    />
                  </div>
                ))}
              {!isValid && (
                <AlertInline
                  message={t('newProposal.configureActions.alertCritical')}
                  variant="critical"
                />
              )}
            </div>
          </FormItem>
        )}
      </AccordionMethod>
    );
  }

  return null;
};

export default SCCAction;
