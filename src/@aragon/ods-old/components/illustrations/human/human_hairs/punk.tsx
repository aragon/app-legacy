import React from 'react';
import {type IconType} from '../../../icons';

export const Punk: IconType = ({height = 160, width = 160, ...props}) => {
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 400 225"
      {...props}
    >
      <path
        d="M203.068 45.5916L191.287 68C180.304 61.9719 147 34.7383 147 34.7383L180.906 44.2521L172.143 20.536L189.565 39.4268L192.415 15L196.462 38.5976L207.817 19.766L203.739 40.7254L217.246 30.7651L211.324 44.0242L223.327 42.2336L215.964 49.4053L226 51.7929L216.67 55.5565C216.67 55.5565 213.793 48.1569 203.068 45.5916Z"
        fill="#001F5C"
      />
    </svg>
  );
};
