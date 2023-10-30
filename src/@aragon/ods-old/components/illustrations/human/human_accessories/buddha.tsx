import React from 'react';
import {type IconType} from '../../../icons';

export const Buddha: IconType = ({height = 160, width = 160, ...props}) => {
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 400 225"
      {...props}
    >
      <ellipse
        cx="198.749"
        cy="68.4469"
        rx="1.74353"
        ry="1.68293"
        transform="rotate(-0.197933 198.749 68.4469)"
        fill="#3164FA"
      />
    </svg>
  );
};
