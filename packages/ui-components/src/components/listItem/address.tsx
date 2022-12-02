import React, {ButtonHTMLAttributes, FC} from 'react';
import styled from 'styled-components';
import {constants} from 'ethers';

import {IsAddress, shortenAddress} from '../../utils/addresses';
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
        <Avatar src={src || ''} />
        <p className="font-bold">{shortenAddress(label)}</p>
      </LeftContent>

      <RightContent>
        {tokenInfo && (
          <p className="text-ui-500">
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
  if (!src) return <IconPerson className="w-2.5 h-2.5" />;
  return <AvatarWallet src={IsAddress(src) ? src : constants.AddressZero} />;
};

const Container = styled.button.attrs(() => {
  const baseLayoutClasses =
    'flex items-center justify-between w-full border-2 border-transparent ';
  const baseStyleClasses = 'bg-ui-0 p-2 tablet:p-3 rounded-xl';
  let className:
    | string
    | undefined = `${baseLayoutClasses} ${baseStyleClasses}`;

  const focusVisibleClasses =
    'focus-visible:ring-0 focus-visible:ring-transparent';
  const hoverClasses = 'hover:text-primary-500 hover:shadow-100';
  const activeClasses = 'active:outline-none active:border-ui-200';

  className += ` text-ui-600 ${focusVisibleClasses} ${activeClasses} ${hoverClasses}`;

  return {className};
})``;

const LeftContent = styled.div.attrs({className: 'flex space-x-2'})``;
const RightContent = styled.div.attrs({
  className: 'flex space-x-2 items-center ft-text-sm',
})``;
