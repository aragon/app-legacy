import React from 'react';
import {styled} from 'styled-components';
import {Button, Icon, IconType} from '@aragon/ods';

export type ListItemHeaderProps = {
  /** Action title */
  buttonText: string;
  /** Action state */
  disabled?: boolean;
  /** Icon to display */
  icon: IconType;
  /** Label to display */
  label: string;
  /** Card orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Value to display */
  value: string;
  onClick: () => void;
};

export const ListItemHeader: React.FC<ListItemHeaderProps> = ({
  orientation = 'vertical',
  disabled = false,
  ...props
}) => {
  const horizontal = orientation === 'horizontal';

  return (
    <Container horizontal={horizontal} data-testid="listItem-header">
      <IconWrapper>
        <Icon icon={props.icon} />
      </IconWrapper>

      <ButtonWrapper horizontal={horizontal}>
        <Button
          onClick={props.onClick}
          state={disabled ? 'disabled' : undefined}
          variant="primary"
          size="md"
        >
          {props.buttonText}
        </Button>
      </ButtonWrapper>

      <Break horizontal={horizontal} />
      <ContentWrapper horizontal={horizontal}>
        <Value>{props.value}</Value>
        <Label>{props.label}</Label>
      </ContentWrapper>
    </Container>
  );
};

type VariableAlignment = {
  horizontal: boolean;
};

const Container = styled.div.attrs<VariableAlignment>(({horizontal}) => ({
  className:
    'flex flex-wrap gap-2 md:gap-6 justify-between items-center ' +
    'p-4 md:p-6 bg-neutral-0 rounded-xl border border-neutral-100 ' +
    `${horizontal ? 'md:flex-nowrap :' : ''}`,
}))<VariableAlignment>``;

const IconWrapper = styled.div.attrs({
  className:
    'order-1 grid place-content-center w-10 h-10 text-primary-500 bg-primary-50 rounded-xl',
})``;

const ButtonWrapper = styled.div.attrs<VariableAlignment>(({horizontal}) => ({
  className: `order-2 ${horizontal ? 'md:order-3' : ''}`,
}))<VariableAlignment>``;

const Break = styled.hr.attrs<VariableAlignment>(({horizontal}) => ({
  className: `order-3 w-full border-0 ${
    horizontal ? 'md:hidden md:order-4' : ''
  }`,
}))<VariableAlignment>``;

const ContentWrapper = styled.div.attrs<VariableAlignment>(({horizontal}) => ({
  className: `order-4 min-w-0 ${
    horizontal ? 'md:flex flex-1 md:order-2 items-baseline gap-x-2' : ''
  }`,
}))<VariableAlignment>``;

const Value = styled.p.attrs({
  className: 'ft-text-2xl text-neutral-800 font-semibold truncate',
})``;

const Label = styled.p.attrs({
  className: 'ft-text-base text-neutral-500 truncate',
})``;
