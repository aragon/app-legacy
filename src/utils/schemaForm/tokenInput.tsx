import React, {useContext} from 'react';
import {
  ISchemaContainerProps,
  ValueAction,
  ValueDispatch,
} from '@restspace/schema-form';
import {
  TokenInput as TokenInputInner,
  TokenInputValue,
} from '../../components/tokenInput';
import {Label} from '@aragon/ods-old';

/**
 * schemaForm/TokenInput component is a wrapper to allow the TokenInput component to be used as a 'container'
 * for schemaForm. This means it's value is an object of type TokenInputValue
 * @param schema The subschema describing the properties managed by this component. Responds to properties title, description, readOnly and custom prop showAmount
 * @param path The property path to the value managed by this component within the schema form as a whole
 * @param value The current value shown in the component
 * @returns React component
 */
export const TokenInput = ({
  schema: schemaObj,
  path,
  value,
}: ISchemaContainerProps) => {
  const dispatch = useContext(ValueDispatch);
  const schema = schemaObj as Record<string, unknown>;

  const tokenInputValue: Partial<TokenInputValue> = value ? value : {};

  const onChange = (tok: TokenInputValue | undefined) => {
    dispatch(ValueAction.set(path, tok || {}));
  };

  return (
    <div className="space-y-1.5">
      <Label
        label={schema.title as string}
        helpText={schema.description as string}
      />
      <TokenInputInner
        tokenAmount={tokenInputValue.amount}
        tokenAddress={tokenInputValue.address}
        showAmount={!!schema.showAmount}
        onChange={onChange}
        disabled={!!schema.readOnly}
      />
    </div>
  );
};
