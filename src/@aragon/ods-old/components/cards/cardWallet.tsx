import React from 'react';
import {styled} from 'styled-components';

import {shortenAddress} from '../../utils/addresses';
import {Avatar} from '../avatar';
import {Button, IconType} from '@aragon/ods';

export type CardWalletProps = {
  /**
   * wallet ENS name or wallet eth address
   */
  name?: string | null;
  /**
   * Wallet eth address
   */
  address: string | null;
  /**
   * Allows the Wallet Card component grow horizontally
   */
  wide: boolean;
  /**
   * Avatar Image source
   */
  src: string | null;
};

/**
 * WalletCard UI component
 */
export const CardWallet: React.FC<CardWalletProps> = ({
  src,
  name,
  address,
  wide = false,
}) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(address ?? '');
  };

  return (
    <Card {...{wide}} data-testid="cardWallet">
      <Content>
        <Avatar size="default" src={src ?? ''} />
        <TextContainer>
          <Title>{shortenAddress(name ?? address)}</Title>
          {name && <Subtitle>{shortenAddress(address)}</Subtitle>}
        </TextContainer>
      </Content>
      <Button
        iconRight={IconType.COPY}
        variant="tertiary"
        size="sm"
        onClick={copyToClipboard}
      >
        copy
      </Button>
    </Card>
  );
};

type ContainerProps = Pick<CardWalletProps, 'wide'>;
const Card = styled.div.attrs<ContainerProps>(({wide}) => ({
  className: `flex items-center ${wide && 'w-full justify-between'} space-x-3`,
}))``;

const Content = styled.div.attrs({
  className: 'flex items-center space-x-3',
})``;

const TextContainer = styled.div.attrs({
  className: 'text-left',
})``;

const Title = styled.p.attrs({
  className: 'text-neutral-700 font-semibold',
})``;

const Subtitle = styled.p.attrs({
  className: 'ft-text-sm text-neutral-500',
})``;
