import React from 'react';
import {type IconType} from '../../../icons';

export const Bald: IconType = ({height = 160, width = 160, ...props}) => {
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 400 225"
      {...props}
    >
      <path
        d="M180 74.5C179.426 69.7333 180 55.5 187.5 50C175 50 170.812 66.25 180 74.5Z"
        fill="#001F5C"
      />
      <path
        d="M219.222 74C219.775 69.5252 219.222 56.1633 212 51C224.037 51 228.07 66.2551 219.222 74Z"
        fill="#001F5C"
      />
    </svg>
  );
};
