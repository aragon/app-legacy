import React from 'react';
import {IconType} from '../../icons';

export const Users: IconType = ({height = 160, width = 160, ...props}) => {
  const pathStyle = {
    fill: 'none',
    stroke: '#001f5c',
    strokeWidth: '2.6',
  };
  const highlightStyle = {
    fill: '#3164fa',
    stroke: '#3164fa',
    strokeWidth: '2.6',
  };
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 210 297"
      {...props}
    >
      <circle
        style={pathStyle}
        id="path117"
        cx="156.84648"
        cy="212.19949"
        r="9.5755844"
      />
      <path
        style={pathStyle}
        d="m 137.74531,247.72042 h 37.85006 c 4.71252,-3.26529 -4.65161,-20.70388 -19.17797,-20.55653 -14.15571,-0.40943 -23.93095,17.39821 -18.67209,20.55653 z"
        id="path3141"
      />
      <circle
        style={pathStyle}
        id="path117-7"
        cx="99.059395"
        cy="212.17943"
        r="9.5755844"
      />
      <path
        style={pathStyle}
        d="m 79.95823,247.70036 h 37.85006 c 4.71252,-3.26529 -4.65161,-20.70389 -19.177972,-20.55654 C 84.47461,226.7344 74.699365,244.54204 79.95823,247.70036 Z"
        id="path3141-7"
      />
      <circle
        style={pathStyle}
        id="path117-2"
        cx="39.43771"
        cy="212.62437"
        r="9.5755844"
      />
      <path
        style={pathStyle}
        d="M 20.336544,248.1453 H 58.186605 C 62.899128,244.88001 53.534992,227.44142 39.008632,227.58877 24.852924,227.17934 15.077679,244.98698 20.336544,248.1453 Z"
        id="path3141-4"
      />
      <circle
        style={pathStyle}
        id="path117-6"
        cx="98.169518"
        cy="151.00047"
        r="9.5755844"
      />
      <path
        style={pathStyle}
        d="m 79.068354,186.52139 h 37.850056 c 4.71253,-3.26529 -4.65161,-20.70388 -19.177968,-20.55653 -14.155708,-0.40942 -23.930953,17.39821 -18.672088,20.55653 z"
        id="path3141-2"
      />
      <circle
        style={pathStyle}
        id="path117-6-8"
        cx="156.67886"
        cy="151.4454"
        r="9.5755844"
      />
      <path
        style={pathStyle}
        d="m 137.5777,186.96633 h 37.85005 c 4.71253,-3.26529 -4.65161,-20.70388 -19.17797,-20.55653 -14.1557,-0.40942 -23.93095,17.39821 -18.67208,20.55653 z"
        id="path3141-2-6"
      />
      <circle
        style={highlightStyle}
        id="path117-3"
        cx="38.992779"
        cy="150.1106"
        r="9.5755844"
      />
      <path
        style={highlightStyle}
        d="m 19.891606,185.63151 h 37.85006 c 4.71252,-3.26529 -4.65161,-20.70388 -19.177972,-20.55653 -14.155708,-0.40943 -23.930953,17.39821 -18.672088,20.55653 z"
        id="path3141-3"
      />
    </svg>
  );
};
