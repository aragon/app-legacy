import React from 'react';
import {styled} from 'styled-components';

import {IsAddress, shortenAddress} from '../../utils/addresses';
import {IconChevronRight, IconLinkExternal} from '../icons';
import {Link} from '../link';

export type CardTransferProps = {
  to: string;
  from: string;
  toLabel: string;
  fromLabel: string;
  toLinkURL: string;
  fromLinkURL: string;
  bgWhite?: boolean;
};

/** Transfer header showing the sender and recipient */
export const CardTransfer: React.FC<CardTransferProps> = ({
  to,
  from,
  toLabel,
  fromLabel,
  toLinkURL,
  fromLinkURL,
  bgWhite = false,
}) => {
  return (
    <CardContainer data-testid="cardTransfer">
      <Card
        label={fromLabel}
        copy={from}
        bgWhite={bgWhite}
        explorerURL={fromLinkURL}
      />
      <IconChevronRight className="text-neutral-600" />
      <Card
        label={toLabel}
        copy={to}
        bgWhite={bgWhite}
        explorerURL={toLinkURL}
      />
    </CardContainer>
  );
};

type CardProps = {
  label: string;
  copy: string;
  bgWhite: boolean;
  explorerURL: string;
};
const Card: React.FC<CardProps> = ({label, copy, bgWhite, explorerURL}) => {
  return (
    <Container bgWhite={bgWhite}>
      <Label>{label}</Label>
      <Link
        label={IsAddress(copy) ? shortenAddress(copy) : copy}
        type="neutral"
        iconRight={<IconLinkExternal />}
        href={explorerURL}
      />
    </Container>
  );
};

const CardContainer = styled.div.attrs({
  className: 'flex items-center space-x-2',
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
