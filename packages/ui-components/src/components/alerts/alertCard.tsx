import React from 'react';
import styled from 'styled-components';

import {IconInfo, IconSuccess, IconWarning} from '../icons';

const styles = {
  info: {
    icon: <IconInfo className="text-info-500" height={20} width={20} />,
    color: 'text-info-800',
    borderColor: 'border-info-400',
  },
  success: {
    icon: <IconSuccess className="text-success-500" height={20} width={20} />,
    color: 'text-success-800',
    borderColor: 'border-success-400',
  },
  warning: {
    icon: <IconWarning className="text-warning-500" height={20} width={20} />,
    color: 'text-warning-800',
    borderColor: 'border-warning-400',
  },
  critical: {
    icon: <IconWarning className="text-critical-500" height={20} width={20} />,
    color: 'text-critical-800',
    borderColor: 'border-critical-400',
  },
};

export type AlertCardProps = {
  /** type and severity of alert */
  mode?: 'info' | 'success' | 'warning' | 'critical';
  /** card title */
  title: string;
  /** card subtitle */
  helpText?: string;
};

export const AlertCard: React.FC<AlertCardProps> = ({
  mode = 'info',
  title,
  helpText,
}) => {
  return (
    <Container mode={mode}>
      <div>{styles[mode].icon}</div>
      <TextContainer>
        <Title mode={mode}>{title}</Title>
        <HelpText>{helpText}</HelpText>
      </TextContainer>
    </Container>
  );
};

type ContainerProps = {
  mode: NonNullable<AlertCardProps['mode']>;
};
const Container = styled.div.attrs(({mode}: ContainerProps) => ({
  className: `flex gap-1.5 box-border px-2 py-1.5 border-2 rounded-xl bg-ui-0 ${styles[mode].borderColor}`,
}))<ContainerProps>``;

const TextContainer = styled.div.attrs(() => ({
  className: 'flex flex-col gap-0.25 ',
}))``;

const Title = styled.div.attrs(({mode}: ContainerProps) => ({
  className: `flex flex-col font-bold ft-text-base  ${styles[mode].color}`,
}))<ContainerProps>``;

const HelpText = styled.div.attrs(() => ({
  className: 'text-ui-600 ft-text-sm',
}))``;
