import {
  ButtonText,
  CheckboxListItem,
  IconSuccess,
  NumberInput,
  TextInput,
  WalletInputLegacy,
} from '@aragon/ui-components';
import {ethers} from 'ethers';
import {t} from 'i18next';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import styled from 'styled-components';

import {useActionsContext} from 'context/actions';
import {useAlertContext} from 'context/alert';
import {useNetwork} from 'context/network';
import {trackEvent} from 'services/analytics';
import {getEtherscanVerifiedContract} from 'services/etherscanAPI';
import {
  getDefaultPayableAmountInput,
  getDefaultPayableAmountInputName,
  getUserFriendlyWalletLabel,
  handleClipboardActions,
} from 'utils/library';
import {Input, SmartContract, SmartContractAction} from 'utils/types';
import {validateAddress} from 'utils/validators';

type InputFormProps = {
  actionIndex: number;
  onComposeButtonClicked: (addAnother: boolean) => void;
};

const InputForm: React.FC<InputFormProps> = ({
  actionIndex,
  onComposeButtonClicked,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const [selectedAction, selectedSC, sccActions]: [
    SmartContractAction,
    SmartContract,
    Record<string, Record<string, Record<string, unknown>>>
  ] = useWatch({
    name: ['selectedAction', 'selectedSC', 'sccActions'],
  });
  const {dao: daoAddressOrEns} = useParams();
  const {addAction, removeAction} = useActionsContext();
  const {setValue, resetField} = useFormContext();
  const [, setFormError] = useState(false);
  const [another, setAnother] = useState(false);

  useEffect(() => setFormError(false), [selectedAction]);

  // add payable input to the selected action if it is a payable method
  const actionInputs = useMemo(() => {
    return selectedAction.stateMutability === 'payable'
      ? [
          ...selectedAction.inputs,
          {...getDefaultPayableAmountInput(t, network)},
        ]
      : selectedAction.inputs;
  }, [network, selectedAction.inputs, selectedAction.stateMutability, t]);

  const composeAction = useCallback(async () => {
    setFormError(false);

    const etherscanData = await getEtherscanVerifiedContract(
      selectedSC.address,
      network
    );

    if (
      etherscanData.status === '1' &&
      etherscanData.result[0].ABI !== 'Contract source code not verified'
    ) {
      // looping through selectedAction.inputs instead of the actionInputs
      // will allow us to ignore the payable input so that encoding using
      // the ABI does not complain
      const functionParams = selectedAction.inputs?.map(input => {
        const param =
          sccActions[selectedSC.address][selectedAction.name][input.name];

        if (typeof param === 'string' && param.indexOf('[') === 0) {
          return JSON.parse(param);
        }
        return param;
      });

      const iface = new ethers.utils.Interface(etherscanData.result[0].ABI);

      try {
        iface.encodeFunctionData(selectedAction.name, functionParams);

        removeAction(actionIndex);
        addAction({
          name: 'external_contract_action',
        });

        resetField(`actions.${actionIndex}`);
        setValue(`actions.${actionIndex}.name`, 'external_contract_action');
        setValue(`actions.${actionIndex}.contractAddress`, selectedSC.address);
        setValue(`actions.${actionIndex}.contractName`, selectedSC.name);
        setValue(`actions.${actionIndex}.functionName`, selectedAction.name);
        setValue(`actions.${actionIndex}.notice`, selectedAction.notice);

        // loop through all the inputs so we pick up the payable one as well
        // and keep it on the form
        actionInputs?.map((input, index) => {
          // add the payable value to the action value directly
          if (input.name === getDefaultPayableAmountInputName(t)) {
            setValue(
              `actions.${actionIndex}.value`,
              sccActions[selectedSC.address][selectedAction.name][input.name]
            );
          }

          // set the form data
          setValue(`actions.${actionIndex}.inputs.${index}`, {
            ...actionInputs[index],
            value:
              sccActions[selectedSC.address][selectedAction.name][input.name],
          });
        });
        resetField('sccActions');

        onComposeButtonClicked(another);

        trackEvent('newProposal_composeAction_clicked', {
          dao_address: daoAddressOrEns,
          smart_contract_address: selectedSC.address,
          smart_contract_name: selectedSC.name,
          method_name: selectedAction.name,
        });
      } catch (e) {
        // Invalid input data being passed to the action
        setFormError(true);
        console.error('Error invalidating action inputs', e);
      }
    }
  }, [
    another,
    actionIndex,
    actionInputs,
    addAction,
    daoAddressOrEns,
    network,
    onComposeButtonClicked,
    removeAction,
    resetField,
    sccActions,
    selectedAction.inputs,
    selectedAction.name,
    selectedAction.notice,
    selectedSC.address,
    selectedSC.name,
    setValue,
    t,
  ]);

  if (!selectedAction) {
    return (
      <div className="desktop:p-6 min-h-full bg-ui-50 desktop:bg-white">
        Sorry, no public Write functions were found for this contract.
      </div>
    );
  }

  return (
    <div className="desktop:p-6 min-h-full bg-ui-50 desktop:bg-white">
      <div className="desktop:flex items-baseline space-x-3">
        <ActionName>{selectedAction.name}</ActionName>
        <div className="hidden desktop:flex items-center space-x-1 text-primary-600">
          <p className="text-sm font-bold text-primary-500">
            {selectedSC.name}
          </p>
          <IconSuccess />
        </div>
      </div>
      <ActionDescription>{selectedAction.notice}</ActionDescription>
      <div className="flex desktop:hidden items-center mt-1 space-x-1 text-primary-600">
        <p className="text-sm font-bold text-primary-500">{selectedSC.name}</p>
        <IconSuccess />
      </div>
      {actionInputs.length > 0 ? (
        <div className="p-3 mt-5 space-y-2 bg-white desktop:bg-ui-50 rounded-xl border border-ui-100 shadow-100">
          {actionInputs.map(input => (
            <div key={input.name}>
              <div className="text-base font-bold text-ui-800 capitalize">
                {input.name}
                <span className="ml-0.5 text-sm normal-case">
                  ({input.type})
                </span>
              </div>
              <div className="mt-0.5 mb-1.5">
                <span className="text-ui-600 ft-text-sm">{input.notice}</span>
              </div>
              <ComponentForType
                key={input.name}
                input={input}
                functionName={`${selectedSC.address}.${selectedAction.name}`}
              />
            </div>
          ))}
        </div>
      ) : null}

      <HStack>
        <ButtonText
          label={t('scc.detailContract.ctaLabel')}
          onClick={composeAction}
        />
        <CheckboxListItem
          label={t('scc.detailContract.checkboxMultipleLabel')}
          multiSelect
          onClick={() => setAnother(!another)}
          type={another ? 'active' : 'default'}
        />
      </HStack>
    </div>
  );
};

const classifyInputType = (inputName: string) => {
  if (inputName.includes('int') && inputName.includes('[]') === false) {
    return 'int';
  } else return inputName;
};

type ComponentForTypeProps = {
  input: Input;
  functionName: string;
  formHandleName?: string;
  defaultValue?: unknown;
  disabled?: boolean;
};

function augmentUint256FieldValue(changedValue: string): string {
  const [beforeDecimalPart, afterDecimalPart] = changedValue.split('.');

  const finalBeforeDecimalsPart =
    !!beforeDecimalPart && beforeDecimalPart.length && beforeDecimalPart !== '-'
      ? beforeDecimalPart
      : '0';

  let finalAfterDecimalsPart = afterDecimalPart;

  let amountZerosToAdd: number;

  if (
    !afterDecimalPart ||
    !afterDecimalPart.length ||
    afterDecimalPart.toLowerCase().startsWith('e') ||
    afterDecimalPart.startsWith('-')
  ) {
    finalAfterDecimalsPart = '';
    amountZerosToAdd = 18;
  } else {
    finalAfterDecimalsPart = afterDecimalPart.substring(0, 18);
    amountZerosToAdd = 18 - finalAfterDecimalsPart.length;
  }

  for (let i = 0; i < amountZerosToAdd; i++) {
    finalAfterDecimalsPart += '0';
  }

  return `${finalBeforeDecimalsPart}.${finalAfterDecimalsPart}`;
}

export const ComponentForType: React.FC<ComponentForTypeProps> = ({
  input,
  functionName,
  formHandleName,
  defaultValue,
  disabled = false,
}) => {
  const {alert} = useAlertContext();
  const {setValue} = useFormContext();

  const formName = formHandleName
    ? formHandleName
    : `sccActions.${functionName}.${input.name}`;

  useEffect(() => {
    if (defaultValue) {
      setValue(formName, defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if we need to add "index" kind of variable to the "name"
  switch (classifyInputType(input.type)) {
    case 'address':
    case 'encodedData':
      return (
        <Controller
          defaultValue=""
          name={formName}
          rules={{
            required: t('errors.required.walletAddress') as string,
            validate: value => validateAddress(value),
          }}
          render={({
            field: {name, value, onBlur, onChange},
            fieldState: {error},
          }) => (
            <WalletInputLegacy
              mode={error ? 'critical' : 'default'}
              name={name}
              value={getUserFriendlyWalletLabel(value, t)}
              onBlur={onBlur}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onChange(e.target.value);
              }}
              placeholder="0x"
              adornmentText={value ? t('labels.copy') : t('labels.paste')}
              disabledFilled={disabled}
              onAdornmentClick={() =>
                handleClipboardActions(value, onChange, alert)
              }
            />
          )}
        />
      );

    case 'int':
    case 'uint8':
    case 'int8':
    case 'uint32':
    case 'int32':
    case 'uint256':
      return (
        <Controller
          defaultValue=""
          name={formName}
          render={({
            field: {name, value, onBlur, onChange},
            fieldState: {error},
          }) => (
            <NumberInput
              name={name}
              onBlur={() => {
                if (value) onChange(augmentUint256FieldValue(value));
                onBlur();
              }}
              onChange={e => {
                /* To augment uint256 with decimals when increment/decrement clicked */
                const prevValue = value || '0';
                const newValue = e.target.value;
                const isControlsUsed =
                  newValue &&
                  Math.abs(Number(prevValue) - Number(newValue)) === 1;

                if (isControlsUsed) {
                  onChange(augmentUint256FieldValue(newValue));
                } else {
                  onChange(newValue);
                }
              }}
              placeholder="0"
              includeDecimal
              disabled={disabled}
              mode={error?.message ? 'critical' : 'default'}
              value={value}
            />
          )}
        />
      );

    case 'tuple':
      return (
        <>
          {input.components?.map(component => (
            <div key={component.name}>
              <div className="mb-1.5 text-base font-bold text-ui-800 capitalize">
                {input.name}
              </div>
              <ComponentForType
                key={component.name}
                input={component}
                functionName={input.name}
                disabled={disabled}
              />
            </div>
          ))}
        </>
      );
      break;

    default:
      return (
        <Controller
          defaultValue=""
          name={formName}
          render={({
            field: {name, value, onBlur, onChange},
            fieldState: {error},
          }) => (
            <TextInput
              name={name}
              onBlur={onBlur}
              onChange={onChange}
              placeholder={`${input.name} (${input.type})`}
              mode={error?.message ? 'critical' : 'default'}
              value={value}
              disabled={disabled}
            />
          )}
        />
      );
  }
};

/** This version of the component returns uncontrolled inputs */
export const DisplayComponentForType: React.FC<{
  input: Input;
  disabled?: boolean;
}> = ({input, disabled}) => {
  const {alert} = useAlertContext();

  // Check if we need to add "index" kind of variable to the "name"
  switch (classifyInputType(input.type)) {
    case 'address':
    case 'encodedData': // custom type for the data field which is encoded bytes
      return (
        <WalletInputLegacy
          name={input.name}
          value={input.value}
          onChange={() => {}}
          placeholder="0x"
          adornmentText={t('labels.copy')}
          disabledFilled={disabled}
          onAdornmentClick={() =>
            handleClipboardActions(input.value as string, () => {}, alert)
          }
        />
      );

    case 'int':
    case 'uint8':
    case 'int8':
    case 'uint32':
    case 'int32':
    case 'uint256':
      return (
        <NumberInput
          name={input.name}
          placeholder="0"
          includeDecimal
          disabled={disabled}
          value={input.value as string}
        />
      );

    case 'tuple':
      return (
        <>
          {input.components?.map(component => (
            <div key={component.name}>
              <div className="mb-1.5 text-base font-bold text-ui-800 capitalize">
                {input.name}
              </div>
              <DisplayComponentForType
                key={component.name}
                input={component}
                disabled={disabled}
              />
            </div>
          ))}
        </>
      );
    default:
      return (
        <TextInput
          name={input.name}
          placeholder={`${input.name} (${input.type})`}
          value={input.value}
          disabled={disabled}
        />
      );
  }
};

export const ComponentForTypeWithFormProvider: React.FC<ComponentForTypeProps> =
  ({input, functionName, formHandleName, defaultValue, disabled = false}) => {
    const methods = useForm({mode: 'onChange'});

    return (
      <FormProvider {...methods}>
        <ComponentForType
          key={input.name}
          input={input}
          functionName={functionName}
          disabled={disabled}
          defaultValue={defaultValue}
          formHandleName={formHandleName}
        />
      </FormProvider>
    );
  };

const ActionName = styled.p.attrs({
  className: 'text-lg font-bold text-ui-800 capitalize truncate',
})``;

const ActionDescription = styled.p.attrs({
  className: 'mt-1 text-sm text-ui-600',
})``;

const HStack = styled.div.attrs({
  className: 'flex justify-between items-center space-x-3 mt-5 ft-text-base',
})``;

export default InputForm;
