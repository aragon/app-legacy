import React, {useRef} from 'react';
import styled from 'styled-components';

import {IconCalendar} from '../icons';

// NOTE: Currently, there are no designs for the actual date-picker.
// TODO: Add styling for date-picker once designs are ready. [VR 07-01-2022]

export type DateInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const DateInput: React.FC<DateInputProps> = ({disabled, ...props}) => {
  const isFF = navigator.userAgent.indexOf('Firefox') !== -1;
  // Temorary add disabled linster for this line typescript cant detect that showPicker is exists on HTMLInputElement
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputRef = useRef<any>(null);

  const handleClick = () => {
    inputRef.current?.showPicker();
  };

  return (
    <InputContainer data-testid="date-input" disabled={disabled}>
      <StyledInput
        id="date"
        type={'date'}
        required
        disabled={disabled}
        ref={inputRef}
        {...props}
      />

      {!disabled && (
        <>
          {/* This is a temporary solution to hide default icon on firefox */}
          {isFF && <Overlay />}
          <IconContainer disabled={disabled} onClick={handleClick}>
            <IconCalendar />
          </IconContainer>
        </>
      )}
    </InputContainer>
  );
};

/* NOTE: I know very similar code already exists in TextInput. But there were a
couple of issues that made it hard to adopt. One of which is that it still
allows for hover and active when disabled. */

type InputContainerProps = Pick<DateInputProps, 'disabled'>;

const InputContainer = styled.div.attrs(({disabled}: InputContainerProps) => {
  const baseClasses =
    'flex relative items-center p-1 rounded-xl border-2 font-normal cursor-pointer';
  let className = `${baseClasses}`;

  if (disabled) {
    className += ' bg-ui-100 text-ui-300 border-ui-200';
  } else {
    const focusVisibleClasses =
      'focus-within:ring-2 focus-within:ring-primary-500';
    const hoverClasses = 'hover:border-ui-300';
    const activeClasses = 'active:border-primary-500 active:ring-0';
    className += ` bg-ui-0 text-ui-600 ${focusVisibleClasses} ${hoverClasses} ${activeClasses}`;
  }
  return {className, disabled};
})<DateInputProps>``;

const Overlay = styled.div`
  width: 32px;
  height: 32px;
  position: absolute;
  right: 40px;
  background: white;
`;

const StyledInput = styled.input.attrs(() => {
  const baseClasses = 'w-full bg-transparent';
  const className = `${baseClasses}`;

  return {className};
})<DateInputProps>`
  ::-webkit-calendar-picker-indicator {
    display: none;
  }

  outline: 0;
`;

const IconContainer = styled.div.attrs(({disabled}: InputContainerProps) => {
  return {className: ` p-1 rounded-xl ${disabled ? 'bg-ui-100' : 'bg-ui-50'}`};
})<DateInputProps>``;
