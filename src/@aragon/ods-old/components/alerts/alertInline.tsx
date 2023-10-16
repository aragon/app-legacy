import React from 'react';
import {styled} from 'styled-components';

import {IconInfo, IconSuccess, IconWarning, type IconType} from '../icons';

export type AlertInlineProps = {
  /** type and severity of alert */
  mode?: 'neutral' | 'success' | 'warning' | 'critical';

  /** alert copy */
  label: string;
  icon?: React.FunctionComponentElement<IconType>;
};

const styles = {
  neutral: {
    icon: <IconInfo className="text-info-500" />,
    color: 'text-info-800',
  },
  success: {
    icon: <IconSuccess className="text-success-500" />,
    color: 'text-success-800',
  },
  warning: {
    icon: <IconWarning className="text-warning-500" />,
    color: 'text-warning-800',
  },
  critical: {
    icon: <IconWarning className="text-critical-500" />,
    color: 'text-critical-800',
  },
};

/**
 * Inline alert used in combination with form-fields
 */
export const AlertInline: React.FC<AlertInlineProps> = ({
  mode = 'neutral',
  label,
  icon,
}) => {
  return (
    <Container data-testid="alertInline" mode={mode}>
      <div>{icon ?? styles[mode].icon}</div>
      <Label>{label}</Label>
    </Container>
  );
};

type ContainerProps = {
  mode: NonNullable<AlertInlineProps['mode']>;
};
const Container = styled.div.attrs<ContainerProps>(({mode}) => ({
  className: `flex items-center space-x-1 ${styles[mode].color}`,
}))<ContainerProps>``;

const Label = styled.p.attrs({className: 'font-semibold ft-text-sm'})``;
