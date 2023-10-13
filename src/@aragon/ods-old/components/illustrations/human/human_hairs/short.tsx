import React from 'react';
import {type IconType} from '../../../icons';

export const Short: IconType = ({height = 160, width = 160, ...props}) => {
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 400 225"
      {...props}
    >
      <path
        d="M179.662 75C179.662 75 178.193 71.9236 175.106 72.3178C171.688 59.2239 174.932 37 203.049 37C231.166 37 224.247 72.2263 224.247 72.2263C224.247 72.2263 221.145 71.539 219.677 75C220.044 66.9244 218.943 62.6943 218.943 62.6943C218.943 62.6943 212.334 59.0409 211.283 51.662C199.501 70.9369 180.029 63.0789 180.029 63.0789L179.662 75Z"
        fill="#001F5C"
      />
    </svg>
  );
};
