import React, {type ButtonHTMLAttributes, type FC} from 'react';
import {styled} from 'styled-components';

import {shortenAddress} from '../../utils/addresses';
import {AvatarWallet} from '../avatar';
import {IconLinkExternal, IconPerson} from '../icons';

type TokenInfo = {
  amount: number;
  symbol: string;
  percentage: number | string;
};

export type ListItemAddressProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string | null;
  /**
   * String representing EITHER a wallet address OR an ens name.
   */
  src: string | null;
  /**
   * Optional token information. Consists of a token amount, symbol and share.
   */
  tokenInfo?: TokenInfo;
};

export const ListItemAddress: FC<ListItemAddressProps> = ({
  label,
  src,
  tokenInfo,
  ...props
}) => {
  return (
    <Container data-testid="listItem-address" {...props}>
      <LeftContent>
        <Avatar src={src ?? ''} />
        <p className="font-semibold">{shortenAddress(label)}</p>
      </LeftContent>

      <RightContent>
        {tokenInfo && (
          <p className="text-neutral-500">
            {tokenInfo.amount} {tokenInfo.symbol} ({tokenInfo.percentage}%)
          </p>
        )}
        <IconLinkExternal />
      </RightContent>
    </Container>
  );
};

type AvatarProps = Pick<ListItemAddressProps, 'src'>;

const Avatar: FC<AvatarProps> = ({src}) => {
  if (!src) {
    return <IconPerson className="h-5 w-5" />;
  }
  return <AvatarWallet src={src} />;
};

const Container = styled.button.attrs(() => {
  const baseLayoutClasses =
    'flex items-center justify-between w-full border-2 border-neutral-0 ';
  const baseStyleClasses = 'bg-neutral-0 p-4 md:p-6 rounded-xl';
  let className:
    | string
    | undefined = `${baseLayoutClasses} ${baseStyleClasses}`;

  const focusVisibleClasses =
    'focus-visible:ring-0 focus-visible:ring-[transparent]';
  const hoverClasses = 'hover:text-primary-500 hover:shadow-neutral';
  const activeClasses = 'active:outline-none active:border-neutral-200';

  className += ` text-neutral-600 ${focusVisibleClasses} ${activeClasses} ${hoverClasses}`;

  return {className};
})``;

const LeftContent = styled.div.attrs({className: 'flex space-x-4'})``;
const RightContent = styled.div.attrs({
  className: 'flex space-x-4 items-center ft-text-sm',
})``;
