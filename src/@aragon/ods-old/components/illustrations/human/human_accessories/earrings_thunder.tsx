import React from 'react';
import {type IconType} from '../../../icons';

export const EarringsThunder: IconType = ({
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
        d="M180.8 83.7H172.763L169 94.0554H174.401L171.954 101.4L180.8 90.8558H177.078L180.8 83.7Z"
        fill="#3164FA"
      />
      <path
        d="M228 83.7H219.963L216.2 94.0554H221.601L219.154 101.4L228 90.8558H224.279L228 83.7Z"
        fill="#3164FA"
      />
    </svg>
  );
};
