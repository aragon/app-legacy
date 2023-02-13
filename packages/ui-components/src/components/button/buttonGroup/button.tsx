import React from 'react';
import {ButtonText} from '../buttonText';
import {useButtonGroupContext} from './buttonGroup';

export type OptionProps = {
  value: string;
  label: string;
  disabled?: boolean;
};

export const Option: React.FC<OptionProps> = ({
  value,
  label,
  disabled = false,
}) => {
  const {bgWhite, selectedValue, onChange} = useButtonGroupContext();

  return (
    <ButtonText
      label={label}
      isActive={selectedValue === value}
      bgWhite={!bgWhite}
      mode="ghost"
      size="small"
      className="justify-center whitespace-nowrap"
      disabled={disabled}
      onClick={() => onChange?.(value)}
    />
  );
};
