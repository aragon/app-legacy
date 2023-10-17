import React, {type ButtonHTMLAttributes, type FC} from 'react';
import {styled} from 'styled-components';

import {shortenAddress} from '../../utils/addresses';
import {AvatarWallet} from '../avatar';
import {IconPerson} from '../icons';
import {Spinner} from '../spinner';

export type ButtonWalletProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /**
   * set wallet Address/Ens
   */
  label: string | null;
  /**
   * Avatar Image source
   */
  src: string | null;
  /**
   * Loading mode
   */
  isLoading?: boolean;
  /**
   * Check if wallet is connected!
   */
  isConnected?: boolean;
};

export const ButtonWallet: FC<ButtonWalletProps> = ({
  label,
  src,
  isLoading = false,
  isConnected = false,
  ...props
}) => {
  return (
    <StyledButton {...props} {...{isLoading}}>
      <StyledLabel>{shortenAddress(label)}</StyledLabel>
      <Avatar {...{isConnected, isLoading, src}} />
    </StyledButton>
  );
};

type AvatarProps = Pick<ButtonWalletProps, 'isLoading' | 'isConnected' | 'src'>;

const Avatar: FC<AvatarProps> = ({isConnected, isLoading, src}) => {
  if (!isConnected) {
    return <IconPerson className="h-5 w-5" />;
  }
  if (isLoading) {
    return <Spinner size="small" />;
  }
  return <AvatarWallet src={src ?? ''} />;
};

type StyledButtonProp = Pick<ButtonWalletProps, 'isLoading'>;

const StyledButton = styled.button.attrs<StyledButtonProp>(({isLoading}) => {
  const className = `${
    isLoading ? 'text-primary-500' : 'text-neutral-600'
  } flex items-center md:space-x-1.5 font-semibold p-1.5 hover:text-neutral-800
    active:text-neutral-800 disabled:text-neutral-300 bg-neutral-0 hover:bg-neutral-100 active:bg-neutral-200
    disabled:bg-neutral-100 rounded-xl focus-visible:ring-2 focus-visible:ring-primary-500`;
  return {className};
})``;

const StyledLabel = styled.span.attrs({
  className: 'md:inline hidden',
})``;
