import React from 'react';
import {styled} from 'styled-components';

import {Icon, IconType} from '@aragon/ods';
export type AlertInlineProps = {
  /** type and severity of alert */
  mode?: 'neutral' | 'success' | 'warning' | 'critical';

  /** alert copy */
  label: string;
  icon?: React.FunctionComponentElement<IconType>;
};

const styles = {
  neutral: {
    icon: <Icon icon={IconType.INFO} className="text-info-500" />,
    color: 'text-info-800',
  },
  success: {
    icon: <Icon icon={IconType.SUCCESS} className="text-info-500" />,
    color: 'text-success-800',
  },
  warning: {
    icon: <Icon icon={IconType.WARNING} className="text-info-500" />,
    color: 'text-warning-800',
  },
  critical: {
    icon: <Icon icon={IconType.CRITICAL} className="text-info-500" />,
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
  className: `flex items-center space-x-2 ${styles[mode].color}`,
}))<ContainerProps>``;

const Label = styled.p.attrs({className: 'font-semibold ft-text-sm'})``;
