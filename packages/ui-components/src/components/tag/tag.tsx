import React from 'react';
import styled from 'styled-components';

export type TagProps = {
  /** Changes a tag's color scheme */
  colorScheme?:
    | 'neutral'
    | 'info'
    | 'warning'
    | 'critical'
    | 'success'
    | 'primary';
  /** Text displayed on the tag */
  label: string;
  className?: string;
};

export const Tag: React.FC<TagProps> = ({
  label,
  colorScheme = 'neutral',
  className,
}) => {
  return (
    <StyledTag data-testid="tag" {...{colorScheme, className}}>
      {label}
    </StyledTag>
  );
};

type StyledTagProps = {
  colorScheme: TagProps['colorScheme'];
};

const StyledTag = styled.div.attrs(({colorScheme}: StyledTagProps) => {
  let colorCode;
  if (colorScheme === 'success') {
    colorCode = 'bg-success-200 text-success-800';
  } else if (colorScheme === 'critical') {
    colorCode = 'bg-critical-200 text-critical-800';
  } else if (colorScheme === 'warning') {
    colorCode = 'bg-warning-200 text-warning-800';
  } else if (colorScheme === 'info') {
    colorCode = 'bg-info-200 text-info-800';
  } else if (colorScheme === 'primary') {
    colorCode = 'bg-primary-100 text-primary-800';
  } else {
    colorCode = 'bg-ui-100 text-ui-600';
  }

  const className = `ft-text-sm text-center px-0.5 font-bold rounded items-center ${colorCode}`;

  return {className, style: {paddingTop: 2, paddingBottom: 2}};
})<StyledTagProps>``;
