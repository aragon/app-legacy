import React, {type SyntheticEvent} from 'react';
import {styled} from 'styled-components';
import FallbackImg from '../../assets/avatar-token.svg';

export type AvatarTokenProps = {
  size?: 'small' | 'medium' | 'large';
  src?: string;
};

export const AvatarToken: React.FC<AvatarTokenProps> = ({
  size = 'medium',
  src,
}) => {
  return (
    <StyledImage
      size={size}
      src={src ?? FallbackImg}
      onError={(e: SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = FallbackImg;
      }}
    />
  );
};

const styles = {
  small: 'w-4 h-4',
  medium: 'w-6 h-6',
  large: 'w-10 h-10',
};

type StyledImageProps = {size: AvatarTokenProps['size']};

const StyledImage = styled.img.attrs<StyledImageProps>(({size = 'medium'}) => {
  return {className: `${styles[size]} rounded-full`};
})<StyledImageProps>``;
