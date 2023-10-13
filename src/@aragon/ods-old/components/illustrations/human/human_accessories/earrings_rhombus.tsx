import React from 'react';
import {type IconType} from '../../../icons';

export const EarringsRhombus: IconType = ({
  height = 160,
  width = 160,
  ...props
}) => {
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 400 225"
      {...props}
    >
      <path
        d="M215.286 91.2992L222.626 83.9515L229.965 91.2992L222.626 98.6469L215.286 91.2992Z"
        fill="#3164FA"
      />
      <path
        d="M169.561 91.2992L176.9 83.9515L184.24 91.2992L176.9 98.6469L169.561 91.2992Z"
        fill="#3164FA"
      />
    </svg>
  );
};
