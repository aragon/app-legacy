import classNames from 'classnames';
import React from 'react';
import type {TagColorScheme, TagProps} from './tag.api';

const colorSchemeClass: Record<TagColorScheme, string> = {
  neutral: 'bg-neutral-100 text-neutral-600',
  info: 'bg-info-200 text-info-800',
  warning: 'bg-warning-200 text-warning-800',
  critical: 'bg-critical-200 text-critical-800',
  success: 'bg-success-200 text-success-800',
  primary: 'bg-primary-100 text-primary-800',
};

export const Tag: React.FC<TagProps> = props => {
  const {label, colorScheme = 'neutral', className} = props;

  const classes = classNames(
    'flex rounded px-1 py-0.25 text-center font-semibold ft-text-sm',
    colorSchemeClass[colorScheme],
    className
  );

  return <div className={classes}>{label}</div>;
};
