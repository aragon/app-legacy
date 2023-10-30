import React from 'react';
import {type IconType} from '../../../icons';

export const LargeStylized: IconType = ({
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
        d="M194.832 76.4021H202.299M175 71.8931H195.91V81.7751H185.23C183.887 81.7756 182.557 81.5204 181.316 81.024C180.074 80.5276 178.947 79.7998 177.997 78.8821C177.047 77.9644 176.293 76.8748 175.779 75.6757C175.265 74.4765 175 73.1911 175 71.8931ZM211.774 81.779H201.074V71.8931H222C222.001 73.1911 221.736 74.4766 221.223 75.676C220.709 76.8754 219.956 77.9652 219.006 78.8833C218.057 79.8013 216.929 80.5296 215.688 81.0264C214.447 81.5233 213.117 81.779 211.774 81.779Z"
        stroke="#001F5C"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
