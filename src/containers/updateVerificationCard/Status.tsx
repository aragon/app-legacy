import React, {ReactNode} from 'react';
import styled from 'styled-components';
import {Spinner, IconRadioCancel, IconSuccess} from '@aragon/ods-old';

export interface StatusProps {
  mode: 'loading' | 'success' | 'error';
  label: ReactNode;
}

const textColors: Record<StatusProps['mode'], string> = {
  loading: 'text-primary-500',
  success: 'text-success-800',
  error: 'text-critical-800',
};

const iconColors: Record<StatusProps['mode'], string> = {
  loading: 'text-primary-500',
  success: 'text-success-500',
  error: 'text-critical-500',
};

const Icon: React.FC<{mode: StatusProps['mode']}> = ({mode}) => {
  switch (mode) {
    case 'loading':
      return <Spinner size="xs" className={iconColors[mode]} />;
    case 'error':
      return <IconRadioCancel className={iconColors[mode]} />;
    default:
      return <IconSuccess className={iconColors[mode]} />;
  }
};

export const Status: React.FC<StatusProps> = ({mode, label}) => {
  return (
    <Content mode={mode}>
      <IconContainer>
        <Icon mode={mode} />
      </IconContainer>
      <div className="text-sm font-semibold md:text-base">{label}</div>
    </Content>
  );
};

const IconContainer = styled.div.attrs({className: 'my-4'})``;

const Content = styled.div.attrs<{mode: StatusProps['mode']}>(({mode}) => {
  const className = `flex items-center gap-x-2 xl:gap-x-4 ${textColors[mode]}`;
  return {className};
})<{mode: StatusProps['mode']}>``;
