import {
  ButtonText,
  NumberInput,
  TextInput,
  WalletInput,
} from '@aragon/ui-components';
import {useActionsContext} from 'context/actions';
import {useAlertContext} from 'context/alert';
import {t} from 'i18next';
import React, {useEffect} from 'react';
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import styled from 'styled-components';
import {
  getUserFriendlyWalletLabel,
  handleClipboardActions,
} from 'utils/library';
import {SmartContractAction, Input, SmartContract} from 'utils/types';
import {validateAddress} from 'utils/validators';

type InputFormProps = {
  actionIndex: number;
  onComposeButtonClicked: () => void;
};

const InputForm: React.FC<InputFormProps> = ({
  actionIndex,
  onComposeButtonClicked,
}) => {
  const [selectedAction, selectedSC, sccActions]: [
    SmartContractAction,
    SmartContract,
    Record<string, Record<string, Record<string, unknown>>>
  ] = useWatch({
    name: ['selectedAction', 'selectedSC', 'sccActions'],
  });
  const {addAction, removeAction} = useActionsContext();
  const {setValue, resetField} = useFormContext();

  if (!selectedAction) {
    return (
      <div className="p-6 min-h-full bg-white">
        Sorry, no public Write functions were found for this contract.
      </div>
    );
  }

  return (
    <div className="p-6 min-h-full bg-white">
      <ActionName>{selectedAction.name}</ActionName>
      <ActionDescription>{selectedAction.notice}</ActionDescription>
      {selectedAction.inputs.length > 0 ? (
        <div className="p-3 mt-5 space-y-2 bg-ui-50 rounded-xl border-ui-100 shadow-100">
          {selectedAction.inputs.map(input => (
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

      <ButtonText
        label="Compose"
        className="mt-5"
        onClick={() => {
          removeAction(actionIndex);
          addAction({
            name: 'external_contract_action',
          });

          resetField(`actions.${actionIndex}`);
          setValue(`actions.${actionIndex}.name`, 'external_contract_action');
          setValue(
            `actions.${actionIndex}.contractAddress`,
            selectedSC.address
          );
          setValue(`actions.${actionIndex}.contractName`, selectedSC.name);
          setValue(`actions.${actionIndex}.functionName`, selectedAction.name);

          selectedAction.inputs?.map((input, index) => {
            setValue(`actions.${actionIndex}.inputs.${index}`, {
              ...selectedAction.inputs[index],
              value:
                sccActions[selectedSC.address][selectedAction.name][input.name],
            });
          });
          resetField('sccActions');
          onComposeButtonClicked();
        }}
      />
    </div>
  );
};

type ComponentForTypeProps = {
  input: Input;
  functionName: string;
  formHandleName?: string;
  defaultValue?: unknown;
  disabled?: boolean;
};

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
  switch (input.type) {
    case 'address':
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
            <WalletInput
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

    case 'uint':
    case 'int':
    case 'uint8':
    case 'int8':
    case 'uint32':
    case 'int32':
    case 'uint256':
    case 'int256':
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
              onBlur={onBlur}
              onChange={onChange}
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
      input.components?.map(component => (
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
      ));
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
  return null;
};

export const ComponentForTypeWithFormProvider: React.FC<
  ComponentForTypeProps
> = ({input, functionName, formHandleName, defaultValue, disabled = false}) => {
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
  className: 'text-lg font-bold text-ui-800 capitalize',
})``;

const ActionDescription = styled.p.attrs({
  className: 'mt-1 text-sm text-ui-600',
})``;

export default InputForm;
