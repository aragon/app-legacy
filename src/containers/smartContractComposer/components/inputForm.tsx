import {
  ButtonText,
  CheckboxListItem,
  IconSuccess,
  NumberInput,
  TextInput,
  WalletInputLegacy,
} from '@aragon/ods';
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
import {
  getDefaultPayableAmountInput,
  getDefaultPayableAmountInputName,
  getUserFriendlyWalletLabel,
  handleClipboardActions,
} from 'utils/library';
import {Input, SmartContract, SmartContractAction} from 'utils/types';
import {isAddress} from 'ethers/lib/utils';

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
  const [another, setAnother] = useState(false);

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
          sccActions?.[selectedSC.address]?.[selectedAction.name]?.[input.name]
        );
      }

      // set the form data
      setValue(`actions.${actionIndex}.inputs.${index}`, {
        ...actionInputs[index],
        value:
          sccActions?.[selectedSC.address]?.[selectedAction.name]?.[
            input.name
          ] || '',
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
  }, [
    removeAction,
    actionIndex,
    addAction,
    resetField,
    setValue,
    selectedSC.address,
    selectedSC.name,
    selectedAction.name,
    selectedAction.notice,
    sccActions,
    actionInputs,
    onComposeButtonClicked,
    another,
    daoAddressOrEns,
    t,
  ]);

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
  isValid?: boolean;
};

export const ComponentForType: React.FC<ComponentForTypeProps> = ({
  input,
  functionName,
  formHandleName,
  defaultValue,
  disabled = false,
  isValid = true,
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
    case 'encodedData':
      return (
        <Controller
          defaultValue=""
          name={formName}
          render={({field: {name, value, onBlur, onChange}}) => (
            <WalletInputLegacy
              mode="default"
              name={name}
              value={value}
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
    case 'address':
      return (
        <Controller
          defaultValue=""
          name={formName}
          render={({field: {name, value, onBlur, onChange}}) => (
            <WalletInputLegacy
              mode={!isValid && !isAddress(value) ? 'critical' : 'default'}
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
          render={({field: {name, value, onBlur, onChange}}) => (
            <NumberInput
              name={name}
              onBlur={onBlur}
              onChange={onChange}
              placeholder="0"
              includeDecimal
              disabled={disabled}
              mode={
                !isValid &&
                !value &&
                input.name !== getDefaultPayableAmountInputName(t)
                  ? 'critical'
                  : 'default'
              }
              value={value}
            />
          )}
        />
      );

    case 'tuple':
      if (input?.components)
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
      return (
        <>
          {Object.entries(input.value as {}).map((value, index) => {
            return (
              <div key={index}>
                <div className="mb-1.5 text-base font-bold text-ui-800 capitalize">
                  {value[0]}
                </div>
                <ComponentForType
                  key={index}
                  functionName={value[0]}
                  input={{value: value[1], type: typeof value[1]} as Input}
                  disabled={disabled}
                />
              </div>
            );
          })}
        </>
      );

    default:
      return (
        <Controller
          defaultValue=""
          name={formName}
          render={({field: {name, value, onBlur, onChange}}) => (
            <TextInput
              name={name}
              onBlur={onBlur}
              onChange={onChange}
              placeholder={`${input.name} (${input.type})`}
              mode={!isValid && !value ? 'critical' : 'default'}
              value={value}
              disabled={disabled}
            />
          )}
        />
      );
  }
};

/** This version of the component returns uncontrolled inputs */
type FormlessComponentForTypeProps = {
  input: Input;
  disabled?: boolean;
};

export function FormlessComponentForType({
  input,
  disabled,
}: FormlessComponentForTypeProps) {
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
      if (input?.components)
        return (
          <>
            {input.components?.map(component => (
              <div key={component.name}>
                <div className="mb-1.5 text-base font-bold text-ui-800 capitalize">
                  {input.name}
                </div>
                <FormlessComponentForType
                  key={component.name}
                  input={component}
                  disabled={disabled}
                />
              </div>
            ))}
          </>
        );
      return (
        <>
          {Object.entries(input.value as {}).map((value, index) => {
            return (
              <div key={index}>
                <div className="mb-1.5 text-base font-bold text-ui-800 capitalize">
                  {value[0]}
                </div>
                <FormlessComponentForType
                  key={index}
                  input={{value: value[1], type: typeof value[1]} as Input}
                  disabled={disabled}
                />
              </div>
            );
          })}
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
}

export function ComponentForTypeWithFormProvider({
  input,
  functionName,
  formHandleName,
  defaultValue,
  disabled = false,
}: ComponentForTypeProps) {
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
}

const ActionName = styled.p.attrs({
  className: 'text-lg font-bold text-ui-800 capitalize truncate',
})``;

const ActionDescription = styled.p.attrs({
  className: 'mt-1 text-sm text-ui-600',
})``;

const HStack = styled.div.attrs({
  className:
    'flex justify-between items-center space-x-3 mt-5 ft-text-base mb-1',
})``;

export default InputForm;
