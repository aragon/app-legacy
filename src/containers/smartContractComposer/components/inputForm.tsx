import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  CheckboxListItem,
  NumberInput,
  TextInput,
  WalletInputLegacy,
} from '@aragon/ods-old';
import {Button, Icon, IconType} from '@aragon/ods';
import {t} from 'i18next';
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

const extractTupleValues = (
  input: Input,
  formData: Record<string, unknown>
) => {
  const tuple: unknown[] = [];

  input.components?.map(component => {
    if (component.type !== 'tuple') {
      tuple.push(formData?.[component.name] || '');
    } else {
      tuple.push(
        extractTupleValues(
          component,
          formData[component.name] as Record<string, unknown>
        )
      );
    }
  });
  return tuple;
};

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
  const [selectedAction, selectedSC, sccActions, writeAsProxy]: [
    SmartContractAction,
    SmartContract,
    Record<string, Record<string, Record<string, unknown>>>,
    boolean,
  ] = useWatch({
    name: ['selectedAction', 'selectedSC', 'sccActions', 'writeAsProxy'],
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

    // check if the action is being written as a proxy
    const contractAddress = writeAsProxy
      ? selectedSC.proxyAddress
      : selectedSC.address;

    resetField(`actions.${actionIndex}`);
    setValue(`actions.${actionIndex}.name`, 'external_contract_action');
    setValue(`actions.${actionIndex}.contractAddress`, contractAddress);
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
      if (input.type === 'tuple') {
        const tuple = extractTupleValues(
          input,
          sccActions?.[selectedSC.address]?.[selectedAction.name]?.[
            input.name
          ] as Record<string, unknown>
        );
        setValue(`actions.${actionIndex}.inputs.${index}`, {
          ...actionInputs[index],
          value: tuple,
        });
      } else {
        setValue(`actions.${actionIndex}.inputs.${index}`, {
          ...actionInputs[index],
          value:
            sccActions?.[selectedSC.address]?.[selectedAction.name]?.[
              input.name
            ] || '',
        });
      }
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
    writeAsProxy,
    selectedSC?.proxy,
    selectedSC?.proxyAddress,
    selectedSC.address,
    selectedSC.name,
    resetField,
    setValue,
    selectedAction.name,
    selectedAction.notice,
    actionInputs,
    onComposeButtonClicked,
    another,
    daoAddressOrEns,
    t,
    sccActions,
  ]);

  return (
    <div className="min-h-full bg-neutral-50 xl:bg-neutral-0 xl:p-12">
      <div className="items-baseline space-x-6 xl:flex">
        <ActionName>{selectedAction.name}</ActionName>
        <div className="hidden items-center space-x-2 text-primary-600 xl:flex">
          <p className="text-sm font-semibold leading-normal text-primary-500">
            {selectedSC.name}
          </p>
          <Icon icon={IconType.SUCCESS} />
        </div>
      </div>
      <ActionDescription>{selectedAction.notice}</ActionDescription>
      <div className="mt-2 flex items-center space-x-2 text-primary-600 xl:hidden">
        <p className="text-sm font-semibold leading-normal text-primary-500">
          {selectedSC.name}
        </p>
        <Icon icon={IconType.SUCCESS} />
      </div>
      {actionInputs.length > 0 ? (
        <div className="mt-10 space-y-4 rounded-xl border border-neutral-100 bg-neutral-0 p-6 shadow-neutral xl:bg-neutral-50">
          {actionInputs.map(input => (
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
                key={`${selectedSC.address}.${selectedAction.name}.${input.name}`}
                input={input}
                functionName={`${selectedSC.address}.${selectedAction.name}`}
              />
            </div>
          ))}
        </div>
      ) : null}

      <HStack>
        <Button onClick={composeAction} size="md" variant="primary">
          {t('scc.detailContract.ctaLabel')}
        </Button>
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
  if (inputName.includes('uint') && inputName.includes('[]') === false) {
    return 'uint';
  } else if (inputName.includes('int') && inputName.includes('[]') === false) {
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

    case 'bool':
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
              mode={
                !isValid && value !== 'true' && value !== 'false'
                  ? 'critical'
                  : 'default'
              }
              value={value}
              disabled={disabled}
            />
          )}
        />
      );

    case 'uint':
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
              disabled={disabled}
              mode={
                !isValid &&
                (!value || value < 0) &&
                input.name !== getDefaultPayableAmountInputName(t)
                  ? 'critical'
                  : 'default'
              }
              value={value}
            />
          )}
        />
      );

    case 'int':
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
            {input.components?.map((component, index) => (
              <div key={component.name} className="ml-6 mt-4">
                <div className="text-base font-semibold capitalize leading-normal text-neutral-800">
                  {component.name}
                  <span className="ml-1 text-sm normal-case leading-normal">
                    ({component.type})
                  </span>
                </div>
                <div className="mb-3 mt-1">
                  <span className="text-neutral-600 ft-text-sm">
                    {component.notice}
                  </span>
                </div>
                <ComponentForType
                  key={`${functionName}.${input.name}.${component.name}`}
                  input={component}
                  functionName={`${functionName}.${input.name}`}
                  formHandleName={
                    formHandleName ? `${formHandleName}[${index}]` : undefined
                  }
                  disabled={disabled}
                  isValid={isValid}
                  defaultValue={
                    defaultValue
                      ? (defaultValue as Array<unknown>)[index]
                      : undefined
                  }
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
                <div className="mb-3 text-base font-semibold capitalize leading-normal text-neutral-800">
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
          render={({field: {name, value, onBlur, onChange}}) => {
            return (
              <TextInput
                name={name}
                onBlur={onBlur}
                onChange={onChange}
                placeholder={`${input.name} (${input.type})`}
                mode={!isValid && !value ? 'critical' : 'default'}
                value={value}
                disabled={disabled}
              />
            );
          }}
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

    case 'uint':
    case 'int':
      return (
        <NumberInput
          name={input.name}
          placeholder="0"
          disabled={disabled}
          value={input.value as string}
        />
      );

    case 'tuple':
      if (input?.components)
        return (
          <>
            {input.components?.map(component => (
              <div key={component.name} className="ml-6">
                <div className="mb-3 text-base font-semibold capitalize leading-normal text-neutral-800">
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
            if (Number.isNaN(parseInt(value[0]))) {
              return (
                <div key={index} className="ml-6">
                  <div className="mb-3 text-base font-semibold capitalize leading-normal text-neutral-800">
                    {value[0]}
                  </div>
                  <FormlessComponentForType
                    key={index}
                    input={{value: value[1], type: typeof value[1]} as Input}
                    disabled={disabled}
                  />
                </div>
              );
            }
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
  className:
    'text-xl leading-normal font-semibold text-neutral-800 capitalize truncate',
})``;

const ActionDescription = styled.p.attrs({
  className: 'mt-2 text-sm leading-normal text-neutral-600',
})``;

const HStack = styled.div.attrs({
  className:
    'flex justify-between items-center space-x-6 mt-10 ft-text-base mb-2',
})``;

export default InputForm;
