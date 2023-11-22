import React from 'react';
import Blockies from 'react-blockies';
import {styled} from 'styled-components';
import {IsAddress} from '../../utils/addresses';

const SQUARES = 8;

export type AvatarWalletProps = {
  size?: 'small' | 'medium' | 'large';
  /**
   * Url of the avatar icon OR wallet address
   */
  src: string;
};

type SizesType = Record<
  NonNullable<AvatarWalletProps['size']>,
  {style: string; scale: number}
>;

const styles: SizesType = {
  small: {style: 'w-4 h-4', scale: 2},
  medium: {style: 'w-6 h-6', scale: 3},
  large: {style: 'w-12 h-12', scale: 6},
};

export const AvatarWallet: React.FC<AvatarWalletProps> = ({
  src,
  size = 'medium',
}) => {
  return IsAddress(src) ? (
    <StyledBlockies size={SQUARES} seed={src} scale={styles[size].scale} />
  ) : (
    <StyledAvatar size={size} src={src} />
  );
};

const StyledBlockies = styled(Blockies).attrs({
  className: 'rounded-full',
})``;

type SizeProps = {size: AvatarWalletProps['size']};
const StyledAvatar = styled.img.attrs<SizeProps>(({size = 'medium'}) => {
  return {
    className: `${styles[size].style} rounded-full`,
  };
})<SizeProps>``;
