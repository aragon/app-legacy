import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import styled from 'styled-components';

import {OptionProps} from './button';

type ButtonContextType = {
  bgWhite: boolean;
  selectedValue: string;
  onChange: (value: string) => void;
};

export const ButtonGroupContext = createContext<ButtonContextType | undefined>(
  undefined
);

export const useButtonGroupContext = () =>
  useContext(ButtonGroupContext) as ButtonContextType;

type ButtonProviderProps = {
  value?: string;
  defaultValue?: string;
  bgWhite: boolean;
  onChange?: (value: string) => void;
};

const ButtonProvider: React.FC<ButtonProviderProps> = ({
  value,
  bgWhite,
  defaultValue,
  onChange: onChangeCallback,
  children,
}) => {
  const isControlled = typeof value !== 'undefined';
  const [internalValue, setInternalValue] = useState(defaultValue || '');

  const onChange = useCallback(
    (nextValue: string) => {
      onChangeCallback?.(nextValue);

      if (!isControlled) setInternalValue(nextValue);
    },
    [isControlled, onChangeCallback]
  );

  const contextValues = useMemo(
    () => ({
      bgWhite,
      selectedValue: isControlled ? (value as string) : internalValue,
      onChange,
    }),
    [bgWhite, internalValue, isControlled, onChange, value]
  );

  console.log('Context value', contextValues.selectedValue);

  return (
    <ButtonGroupContext.Provider value={contextValues}>
      {children}
    </ButtonGroupContext.Provider>
  );
};

export type ButtonGroupProps = {
  value?: string;
  bgWhite: boolean;
  defaultValue: string;
  onChange?: (value: string) => void;
  children: React.FunctionComponentElement<OptionProps>[];
};

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  value,
  bgWhite,
  defaultValue,
  onChange,
  children,
}) => {
  return (
    <ButtonProvider
      bgWhite={bgWhite}
      defaultValue={defaultValue}
      value={value}
      onChange={onChange}
    >
      <HStack data-testid="buttonGroup" bgWhite={bgWhite}>
        {children}
      </HStack>
    </ButtonProvider>
  );
};

type HStackProps = {
  bgWhite: boolean;
};

const HStack = styled.div.attrs(({bgWhite}: HStackProps) => ({
  className: `flex rounded-xl p-0.5 space-x-1.5 
    ${bgWhite ? 'bg-ui-50' : 'bg-ui-0'}
  `,
}))<HStackProps>``;
