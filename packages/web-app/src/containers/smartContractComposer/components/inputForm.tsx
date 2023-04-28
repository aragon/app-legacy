import {NumberInput, ValueInput} from '@aragon/ui-components';
import {useAlertContext} from 'context/alert';
import {t} from 'i18next';
import React from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {
  getUserFriendlyWalletLabel,
  handleClipboardActions,
} from 'utils/library';
import {SmartContractAction, Input} from 'utils/types';
import {validateAddress} from 'utils/validators';

const InputForm: React.FC = () => {
  const [selectedAction]: [SmartContractAction] = useWatch({
    name: ['selectedAction'],
  });

  return (
    <div className="p-6 min-h-full bg-white">
      <p className="text-lg font-bold text-ui-800 capitalize">
        {selectedAction.name}
      </p>
      <p className="mt-1 text-sm text-ui-600">
        @notice as help text; This is the description of the method provided by
        NatSpec Format or if those are our smart contracts, by further
        implementation
      </p>
      <div className="p-3 mt-5 space-y-2 bg-ui-50 rounded-xl border-ui-100 shadow-100">
        {selectedAction.inputs.map(input => (
          <div key={input.name}>
            <div className="mb-1.5 text-base font-bold text-ui-800 capitalize">
              {input.name}
            </div>
            <ComponentForType
              key={input.name}
              input={input}
              functionName={selectedAction.name}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

type ComponentForTypeProps = {
  input: Input;
  functionName: string;
};

const ComponentForType: React.FC<ComponentForTypeProps> = ({
  input,
  functionName,
}) => {
  const {control} = useFormContext();
  const {alert} = useAlertContext();

  switch (input.type) {
    case 'address':
      return (
        <Controller
          defaultValue=""
          // Check if we need to add "index" kind of variable to the "name"
          name={`sccActions.${functionName}.${input.name}`}
          control={control}
          rules={{
            required: t('errors.required.walletAddress') as string,
            validate: value => validateAddress(value),
          }}
          render={({
            field: {name, value, onBlur, onChange},
            fieldState: {error},
          }) => (
            <ValueInput
              mode={error ? 'critical' : 'default'}
              name={name}
              value={getUserFriendlyWalletLabel(value, t)}
              onBlur={onBlur}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onChange(e.target.value);
              }}
              placeholder="0x"
              adornmentText={value ? t('labels.copy') : t('labels.paste')}
              onAdornmentClick={() =>
                handleClipboardActions(value, onChange, alert)
              }
            />
          )}
        />
      );

    case 'uint':
    case 'int':
    case 'uint256':
    case 'int256':
      return (
        <Controller
          defaultValue=""
          name={`sccActions.${functionName}.${input.name}`}
          control={control}
          rules={{
            required: t('errors.required.walletAddress') as string,
            validate: value => validateAddress(value),
          }}
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
              mode={error?.message ? 'critical' : 'default'}
              value={value}
            />
          )}
        />
      );

    case 'tuple':
      console.log(input.type);
      input.components?.map(component => (
        <div key={component.name}>
          <div className="mb-1.5 text-base font-bold text-ui-800 capitalize">
            {input.name}
          </div>
          <ComponentForType
            key={component.name}
            input={component}
            functionName={input.name}
          />
        </div>
      ));
      break;

    default:
      return <p>TBD: Implement &quot;{input.type}&quot; type</p>;
  }
  return null;
};

export default InputForm;
