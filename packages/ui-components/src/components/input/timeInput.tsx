import React, {useMemo} from 'react';
import styled from 'styled-components';
import {Option, ButtonGroup} from '../button/buttonGroup';

export type valueType = {time: string; midday: 'pm' | 'am'};

export type TimeInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Changes a input's color schema */
  mode?: 'default' | 'success' | 'warning' | 'critical';
  disabled?: boolean;
  onChange: (value: string) => void;
  width?: number;
  value: string;
};

export const TimeInput: React.FC<TimeInputProps> = ({
  mode = 'default',
  disabled,
  width,
  value,
  onChange: onChangeCallback,
  ...props
}) => {
  const midday = useMemo(() => {
    const hours = Number(value?.match(/^(\d+)/)?.[1]);
    return hours > 11 ? 'pm' : 'am';
  }, [value]);

  const onChange = (
    nextValue: React.FormEvent<HTMLInputElement> | string,
    type: 'time' | 'midday'
  ) => {
    if (type === 'time') {
      const currentTarget = (nextValue as React.FormEvent<HTMLInputElement>)
        .target;

      const hours = Number(
        (currentTarget as HTMLInputElement).value.match(/^(\d+)/)?.[1]
      );

      const minutes = Number(
        (currentTarget as HTMLInputElement).value.match(/:(\d+)/)?.[1]
      );

      let sHours = hours.toString();
      let sMinutes = minutes.toString();
      if (hours < 10) sHours = '0' + sHours;
      if (minutes < 10) sMinutes = '0' + sMinutes;

      onChangeCallback(sHours + ':' + sMinutes);
    } else {
      let hours = Number(value.match(/^(\d+)/)?.[1]);
      const minutes = Number(value.match(/:(\d+)/)?.[1]);

      if (nextValue === 'am' && hours > 12) {
        hours = hours - 12;
      }

      if (nextValue === 'pm' && hours < 12) {
        hours = hours + 12;
      }

      let sHours = hours.toString();
      let sMinutes = minutes.toString();
      if (hours < 10) sHours = '0' + sHours;
      if (minutes < 10) sMinutes = '0' + sMinutes;

      onChangeCallback(sHours + ':' + sMinutes);
    }
  };

  return (
    <Container data-testid="time-input" {...{mode, disabled, width}}>
      <StyledTimeInput
        {...props}
        disabled={disabled}
        onChange={e => onChange(e, 'time')}
        type={'time'}
        value={value}
        required
      />
      {/* TODO: This Radio button need to be customized. For now we used a
          default Radio button but it should update soon
      */}
      <ButtonGroup
        bgWhite
        defaultValue={'am'}
        onChange={e => onChange(e, 'midday')}
        value={midday}
      >
        <Option value="am" label="AM" />
        <Option value="pm" label="PM" />
      </ButtonGroup>
    </Container>
  );
};

export type StyledContainerProps = Pick<
  TimeInputProps,
  'mode' | 'disabled' | 'width'
>;

const Container = styled.div.attrs(
  ({mode, disabled, width}: StyledContainerProps) => {
    let className = `${
      disabled ? 'bg-ui-100' : 'bg-ui-0'
    } inline-flex p-1 bg-ui-0 ${
      width ? '' : 'w-30'
    } focus:outline-none items-center font-normal
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

const StyledTimeInput = styled.input.attrs(({disabled}) => {
  const className: string | undefined = `${
    disabled ? 'text-ui-300' : 'text-ui-600'
  } bg-transparent focus:outline-none margin-0 w-full`;

  return {
    className,
  };
})`
  ::-webkit-calendar-picker-indicator {
    display: none;
  }
  ::-webkit-datetime-edit-ampm-field {
    display: none;
  }
`;
