import React from 'react';
import styled from 'styled-components';
import {
  IconCheckboxDefault,
  IconCheckboxMulti,
  IconCheckboxSelected,
  IconRadioDefault,
  IconRadioSelected,
} from '../icons';

export const Icons = {
  multiSelect: {
    active: <IconCheckboxSelected />,
    multi: <IconCheckboxMulti />,
    default: <IconCheckboxDefault />,
    error: <IconCheckboxDefault />,
  },
  radio: {
    active: <IconRadioSelected />,
    multi: <IconRadioDefault />,
    default: <IconRadioDefault />,
    error: <IconRadioDefault />,
  },
};

export type CheckboxListItemProps = {
  label: string;
  helptext?: string;
  disabled?: boolean;
  multiSelect?: boolean;
  type?: 'default' | 'error' | 'active' | 'multi';
  onClick?: React.MouseEventHandler;
};

export const CheckboxListItem: React.FC<CheckboxListItemProps> = ({
  label,
  helptext,
  multiSelect = false,
  disabled = false,
  type = 'default',
  onClick,
}) => {
  return (
    <Container
      data-testid="checkboxListItem"
      type={type}
      disabled={disabled}
      {...(disabled ? {} : {onClick})}
    >
      <HStack disabled={disabled} type={type}>
        <p className="font-bold">{label}</p>
        {Icons[multiSelect ? 'multiSelect' : 'radio'][type]}
      </HStack>
      {helptext && <Helptext>{helptext}</Helptext>}
    </Container>
  );
};

type ContainerTypes = {
  disabled: boolean;
  type: CheckboxListItemProps['type'];
};

const Container = styled.div.attrs(({disabled, type}: ContainerTypes) => ({
  className: `py-1.5 px-2 rounded-xl border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
    disabled
      ? 'bg-ui-100 border-ui-300'
      : `bg-ui-0 group hover:border-primary-500 cursor-pointer ${
          type === 'error'
            ? 'border-critical-500'
            : type !== 'default'
            ? 'border-primary-500'
            : 'border-ui-100'
        }`
  }`,
  tabIndex: disabled ? -1 : 0,
}))<ContainerTypes>``;

const HStack = styled.div.attrs(({disabled, type}: ContainerTypes) => ({
  className: `flex justify-between items-center group-hover:text-primary-500 space-x-1.5 ${
    disabled
      ? 'text-ui-600'
      : type !== 'default'
      ? 'text-primary-500'
      : 'text-ui-600'
  }`,
}))<ContainerTypes>``;

const Helptext = styled.p.attrs({
  className: 'ft-text-sm text-ui-500 mt-0.25 mr-3.5',
})``;
