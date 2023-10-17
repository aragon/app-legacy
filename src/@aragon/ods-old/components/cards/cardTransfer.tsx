import React from 'react';
import {styled} from 'styled-components';

import {IsAddress, shortenAddress} from '../../utils/addresses';
import {IconChevronRight} from '../icons';

export type CardTransferProps = {
  to: string;
  from: string;
  toLabel: string;
  fromLabel: string;
  bgWhite?: boolean;
};

/** Transfer header showing the sender and recipient */
export const CardTransfer: React.FC<CardTransferProps> = ({
  to,
  from,
  toLabel,
  fromLabel,
  bgWhite = false,
}) => {
  return (
    <CardContainer data-testid="cardTransfer">
      <Card label={fromLabel} copy={from} bgWhite={bgWhite} />
      <IconChevronRight className="text-neutral-600" />
      <Card label={toLabel} copy={to} bgWhite={bgWhite} />
    </CardContainer>
  );
};

type CardProps = {
  label: string;
  copy: string;
  bgWhite: boolean;
};
const Card: React.FC<CardProps> = ({label, copy, bgWhite}) => {
  return (
    <Container bgWhite={bgWhite}>
      <Label>{label}</Label>
      <Value isAddress={IsAddress(copy)}>
        {IsAddress(copy) ? shortenAddress(copy) : copy}
      </Value>
    </Container>
  );
};

const CardContainer = styled.div.attrs({
  className: 'flex items-center space-x-1',
})``;

type ContainerProps = {bgWhite: boolean};
const Container = styled.div.attrs<ContainerProps>(({bgWhite}) => {
  return {
    className: `flex-1 py-3 px-4 min-w-0 text-left ${
      bgWhite ? 'bg-neutral-50' : 'bg-neutral-0'
    } rounded-xl`,
  };
})<ContainerProps>``;

const Label = styled.p.attrs({
  className: 'ft-text-sm text-neutral-500 capitalize',
})``;

// TODO: Revisit address shortening
type ValueProps = {isAddress: boolean};
const Value = styled.p.attrs<ValueProps>(({isAddress}) => {
  const className = isAddress
    ? 'font-semibold text-neutral-800'
    : 'overflow-hidden font-semibold text-neutral-800 text-ellipsis whitespace-nowrap';

  return {className};
})<ValueProps>``;
