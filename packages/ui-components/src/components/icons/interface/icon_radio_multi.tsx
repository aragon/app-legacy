import React from 'react';
import {IconType} from '..';

export const IconRadioMulti: IconType = ({
  height = 16,
  width = 16,
  ...props
}) => {
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 16 16"
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 8.5a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm2 0a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-12 0a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Z"
      />
    </svg>
  );
};
