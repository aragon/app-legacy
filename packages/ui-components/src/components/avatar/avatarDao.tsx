import React, {HTMLAttributes, useEffect, useMemo, useState} from 'react';
import styled from 'styled-components';

export interface AvatarDaoProps extends HTMLAttributes<HTMLElement> {
  daoName: string;
  src?: string;
  size?: 'small' | 'medium' | 'big' | 'hero' | 'unset';
  onClick?: () => void;
}

export const AvatarDao: React.FC<AvatarDaoProps> = ({
  daoName,
  src,
  size = 'medium',
  onClick,
  ...props
}) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  const daoInitials = useMemo(() => {
    // To allow for no name daos - should not be a thing
    if (!daoName) return '';

    const arr = daoName.trim().split(' ');
    if (arr.length === 1) return arr[0][0];
    else return arr[0][0] + arr[1][0];
  }, [daoName]);

  return error || !src ? (
    <FallBackAvatar onClick={onClick} size={size} {...props}>
      <DaoInitials>{daoInitials?.toUpperCase()}</DaoInitials>
    </FallBackAvatar>
  ) : (
    <Avatar
      src={src}
      size={size}
      alt="dao avatar"
      onClick={onClick}
      onError={() => setError(true)}
      {...props}
    />
  );
};

type AvatarPropsType = {
  size: NonNullable<AvatarDaoProps['size']>;
};

const sizes = {
  small: 'w-3 h-3 ft-text-xs',
  medium: 'w-6 h-6 ft-text-base',
  big: 'w-10 h-10 ft-text-lg',
  hero: 'w-14 h-14 ft-text-xl',
};

const Avatar = styled.img.attrs(({size}: AvatarPropsType) => ({
  className: `${size !== 'unset' && sizes[size]} rounded-full` as string,
}))<AvatarPropsType>``;

const FallBackAvatar = styled.div.attrs(({size}: AvatarPropsType) => ({
  className:
    'flex items-center justify-center font-bold text-ui-0 bg-gradient-to-r' +
    ` from-primary-500 to-primary-800 ${
      size !== 'unset' && sizes[size]
    } rounded-full border`,
}))<AvatarPropsType>``;

const DaoInitials = styled.p.attrs({
  className: 'w-4 h-4 flex items-center justify-center',
})``;
