import React from 'react';
import styled from 'styled-components';
import {ButtonText} from '../button';

import {IconType} from '../icons';

export type ListItemHeaderProps = {
  /** Action title */
  buttonText: string;
  /** Icon to display */
  icon: React.FunctionComponentElement<IconType>;
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
  ...props
}) => {
  const horizontal = orientation === 'horizontal';

  return (
    <Container horizontal={horizontal} data-testid="listItem-header">
      <IconWrapper>{props.icon}</IconWrapper>

      <ButtonWrapper horizontal={horizontal}>
        <ButtonText label={props.buttonText} onClick={props.onClick} />
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

const Container = styled.div.attrs(({horizontal}: VariableAlignment) => ({
  className:
    'flex flex-wrap gap-1 tablet:gap-3 justify-between items-center ' +
    'p-2 tablet:p-3 bg-ui-0 rounded-xl border border-ui-100 ' +
    `${horizontal ? 'tablet:flex-nowrap :' : ''}`,
}))<VariableAlignment>``;

const IconWrapper = styled.div.attrs({
  className:
    'order-1 grid place-content-center w-5 h-5 text-primary-500 bg-primary-50 rounded-xl',
})``;

const ButtonWrapper = styled.div.attrs(({horizontal}: VariableAlignment) => ({
  className: `order-2 ${horizontal ? 'tablet:order-3' : ''}`,
}))<VariableAlignment>``;

const Break = styled.hr.attrs(({horizontal}: VariableAlignment) => ({
  className: `order-3 w-full border-0 ${
    horizontal ? 'tablet:hidden tablet:order-4' : ''
  }`,
}))<VariableAlignment>``;

const ContentWrapper = styled.div.attrs(({horizontal}: VariableAlignment) => ({
  className: `order-4 min-w-0 ${
    horizontal ? 'tablet:flex flex-1 tablet:order-2 items-baseline gap-x-1' : ''
  }`,
}))<VariableAlignment>``;

const Value = styled.p.attrs({
  className: 'ft-text-2xl text-ui-800 font-bold truncate',
})``;

const Label = styled.p.attrs({
  className: 'ft-text-base text-ui-500 truncate',
})``;
