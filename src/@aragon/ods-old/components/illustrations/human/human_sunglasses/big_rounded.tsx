import React from 'react';
import {type IconType} from '../../../icons';

export const BigRounded: IconType = ({height = 160, width = 160, ...props}) => {
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 400 225"
      {...props}
    >
      <path
        d="M195.321 73.8853H202.918M197.469 75.3415C197.469 80.5007 193.292 84.6831 188.138 84.6831C182.985 84.6831 178.808 80.5007 178.808 75.3415C178.808 70.1823 182.985 66 188.138 66C193.292 66 197.469 70.1823 197.469 75.3415ZM219.81 75.3415C219.81 80.5007 215.632 84.6831 210.479 84.6831C205.326 84.6831 201.148 80.5007 201.148 75.3415C201.148 70.1823 205.326 66 210.479 66C215.632 66 219.81 70.1823 219.81 75.3415Z"
        stroke="#001F5C"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
