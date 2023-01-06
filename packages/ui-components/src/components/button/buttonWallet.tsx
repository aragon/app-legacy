import styled from 'styled-components';
import React, {ButtonHTMLAttributes, FC} from 'react';

import {Spinner} from '../spinner';
import {IconPerson} from '../icons';
import {AvatarWallet} from '../avatar';
import {shortenAddress} from '../../utils/addresses';

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
  if (!isConnected) return <IconPerson className="w-2.5 h-2.5" />;
  if (isLoading) return <Spinner size="small" />;
  return <AvatarWallet src={src || ''} />;
};

type StyledButtonProp = Pick<ButtonWalletProps, 'isLoading'>;

const StyledButton = styled.button.attrs(({isLoading}: StyledButtonProp) => {
  const className = `${
    isLoading ? 'text-primary-500' : 'text-ui-600'
  } flex items-center tablet:space-x-1.5 font-bold p-1.5 hover:text-ui-800
    active:text-ui-800 disabled:text-ui-300 bg-ui-0 hover:bg-ui-100 active:bg-ui-200
    disabled:bg-ui-100 rounded-xl focus-visible:ring-2 focus-visible:ring-primary-500`;
  return {className};
})``;

const StyledLabel = styled.span.attrs({
  className: 'tablet:inline hidden',
})``;
