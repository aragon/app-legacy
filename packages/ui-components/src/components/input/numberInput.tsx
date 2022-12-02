import React, {useRef} from 'react';
import styled from 'styled-components';
import {ButtonIcon} from '../button';
import {IconAdd, IconRemove} from '../icons';

export type NumberInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Changes a input's color schema */
  mode?: 'default' | 'success' | 'warning' | 'critical';
  disabled?: boolean;
  width?: number;
  percentage?: boolean;
  value: string;
  /** Determines whether decimal values are accepted */
  includeDecimal?: boolean;
};

export const NumberInput: React.FC<NumberInputProps> = ({
  mode = 'default',
  disabled,
  width,
  percentage = false,
  value,
  includeDecimal,
  onChange,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStepperChange = (mode: 'up' | 'down') => {
    mode === 'up' ? inputRef.current?.stepUp() : inputRef.current?.stepDown();

    // For Calling th onChange Function
    inputRef.current?.dispatchEvent(new Event('input', {bubbles: true}));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!includeDecimal && event.key === '.') event?.preventDefault();
    else props.onKeyDown?.(event);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // this handles pasting in the value/ could also use onPaste event
    if (!includeDecimal)
      event.target.value = event.target.value.replace(/[^0-9]/g, '');

    onChange?.(event);
  };

  return (
    <Container data-testid="number-input" {...{mode, disabled, width}}>
      <StyledIconButton
        name="down"
        mode="ghost"
        size="small"
        icon={<IconRemove />}
        disabled={disabled}
        onClick={() => handleStepperChange('down')}
      />
      <InputWrapper>
        <StyledNumberInput
          {...props}
          {...{value}}
          {...(percentage && {percentage, min: 0, max: 100})}
          ref={inputRef}
          disabled={disabled}
          type={'number'}
          placeholder={percentage ? '0 %' : '0'}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onWheel={e => {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }}
        />
        {percentage && value !== '' && <Percent disabled={disabled}>%</Percent>}
      </InputWrapper>
      <StyledIconButton
        name="up"
        mode="ghost"
        size="small"
        icon={<IconAdd />}
        disabled={disabled}
        onClick={() => handleStepperChange('up')}
      />
    </Container>
  );
};

export type StyledContainerProps = Pick<
  NumberInputProps,
  'mode' | 'disabled' | 'width'
>;

const Container = styled.div.attrs(
  ({mode, disabled, width}: StyledContainerProps) => {
    let className = `${
      disabled ? 'bg-ui-100' : 'bg-ui-0'
    } inline-flex p-1 bg-ui-0 ${
      width ? '' : 'w-full'
    } focus:outline-none items-center h-6
      focus-within:ring-2 focus-within:ring-primary-500 justify-between
      rounded-xl hover:border-ui-300 border-2 active:border-primary-500 
    `;

    if (mode === 'default') {
      className += 'border-ui-100';
    } else if (mode === 'success') {
      className += 'border-success-600';
    } else if (mode === 'warning') {
      className += 'border-warning-600';
    } else if (mode === 'critical') {
      className += 'border-critical-600';
    }

    return {
      className,
      ...(width && {style: {width: `${width}px`}}),
    };
  }
)<StyledContainerProps>``;

const InputWrapper = styled.div.attrs({
  className: 'flex justify-center w-4/5',
})``;

export type StyledNumberInputProps = Pick<
  NumberInputProps,
  'disabled' | 'percentage'
>;

export type PercentProps = Pick<NumberInputProps, 'disabled'>;

const Percent = styled.label.attrs(({disabled}: PercentProps) => {
  const className: string | undefined = `${
    disabled ? 'text-ui-300' : 'text-ui-600'
  }`;
  return {
    className,
  };
})<PercentProps>``;

const StyledNumberInput = styled.input.attrs(
  ({disabled, percentage}: StyledNumberInputProps) => {
    const className: string | undefined = `${
      disabled ? 'text-ui-300' : 'text-ui-600'
    } bg-transparent margin-0 ${percentage ? 'w-3.5' : 'w-full'}`;
    return {
      className,
    };
  }
)<StyledNumberInputProps>`
  text-align: center;
  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;

  outline: 0;
`;

const StyledIconButton = styled(ButtonIcon).attrs({
  className: 'rounded-xl',
})``;
