import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {styled} from 'styled-components';

import {type OptionProps} from './button';

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
  children: ReactNode;
};

const ButtonProvider: React.FC<ButtonProviderProps> = ({
  value,
  bgWhite,
  defaultValue,
  onChange: onChangeCallback,
  children,
}) => {
  const isControlled = typeof value !== 'undefined';
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');

  const onChange = useCallback(
    (nextValue: string) => {
      onChangeCallback?.(nextValue);

      if (!isControlled) {
        setInternalValue(nextValue);
      }
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
  children: Array<React.FunctionComponentElement<OptionProps>>;
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

const HStack = styled.div.attrs<HStackProps>(({bgWhite}) => ({
  className: `flex rounded-xl p-0.5 space-x-1.5
    ${bgWhite ? 'bg-neutral-50' : 'bg-neutral-0'}
  `,
}))<HStackProps>``;
