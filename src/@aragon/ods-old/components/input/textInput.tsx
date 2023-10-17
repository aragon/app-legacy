import React, {type ReactNode} from 'react';
import {styled} from 'styled-components';

export type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Changes a input's color schema */
  mode?: 'default' | 'success' | 'warning' | 'critical';
  /**
   * left adornment
   */
  leftAdornment?: ReactNode;
  /**
   * right adornment
   */
  rightAdornment?: ReactNode;
  disabled?: boolean;
  containerClassName?: string;
};

/** Simple input with variable styling (depending on mode) */
export const TextInput: React.FC<TextInputProps> = ({
  mode = 'default',
  disabled,
  leftAdornment,
  rightAdornment,
  containerClassName,
  ...props
}) => {
  return (
    <Container
      data-testid="input"
      className={containerClassName}
      {...{mode, disabled}}
    >
      {leftAdornment}
      <InputWrapper {...{leftAdornment}}>
        <StyledInput disabled={disabled} {...props} />
      </InputWrapper>
      {rightAdornment}
    </Container>
  );
};

type StyledContainerProps = Pick<
  TextInputProps,
  'mode' | 'disabled' | 'containerClassName'
>;

export const Container = styled.div.attrs<StyledContainerProps>(
  ({mode, disabled, containerClassName}) => {
    let className = `${
      disabled ? 'bg-neutral-100 border-neutral-200 border-2' : 'bg-neutral-0'
    } flex items-center focus-within:ring-2
    focus-within:ring-primary-500
    rounded-xl hover:border-neutral-300 border-2 h-12
    active:border-primary-500 active:ring-0 `;

    if (containerClassName) {
      className += containerClassName;
    }

    if (mode === 'default') {
      className += 'border-neutral-100';
    } else if (mode === 'success') {
      className += 'border-success-600';
    } else if (mode === 'warning') {
      className += 'border-warning-600';
    } else if (mode === 'critical') {
      className += 'border-critical-600';
    }

    return {className};
  }
)<StyledContainerProps>``;

export const StyledInput = styled.input.attrs(() => {
  const className: string | undefined = 'w-full bg-transparent h-4 truncate';
  return {className};
})`
  outline: 0;
`;

type StyledInputWrapper = Pick<TextInputProps, 'leftAdornment'>;

const InputWrapper = styled.div.attrs<StyledInputWrapper>(
  ({leftAdornment}) => ({
    className: `py-1.5 ${leftAdornment ? 'pr-2' : 'px-2'} w-full`,
  })
)``;
