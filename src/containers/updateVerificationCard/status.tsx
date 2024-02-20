import React, {ReactNode} from 'react';
import styled from 'styled-components';
import {
  Icon,
  IconType,
  Spinner,
  SpinnerVariant,
  Button,
  Tag,
} from '@aragon/ods';

export interface StatusProps {
  mode: 'loading' | 'success' | 'error';
  label: ReactNode;
  description?: ReactNode;
  DetailsButtonLabel?: string;
  DetailsButtonSrc?: string;
  ErrorList?: string[];
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

const spinnerColors: Record<StatusProps['mode'], SpinnerVariant> = {
  loading: 'primary',
  success: 'success',
  error: 'critical',
};

const StatusIcon: React.FC<{mode: StatusProps['mode']}> = ({mode}) => {
  switch (mode) {
    case 'loading':
      return <Spinner size="sm" variant={spinnerColors[mode]} />;
    case 'error':
      return <Icon icon={IconType.REMOVE} className={iconColors[mode]} />;
    default:
      return <Icon icon={IconType.SUCCESS} className={iconColors[mode]} />;
  }
};

export const Status: React.FC<StatusProps> = ({
  mode,
  label,
  description,
  DetailsButtonLabel,
  DetailsButtonSrc,
  ErrorList,
}) => {
  return (
    <Content>
      <IconContainer>
        <StatusIcon mode={mode} />
      </IconContainer>
      <Wrapper>
        <Label mode={mode}>{label}</Label>
        {description && (
          <div className="mb-3 mt-1 text-sm leading-normal text-neutral-600 md:text-base">
            {description}
          </div>
        )}
        {mode === 'error' && (
          <div className="mb-3 flex flex-wrap gap-2">
            {ErrorList?.map((item, index) => (
              <Tag key={index} label={item} variant="critical" />
            ))}
          </div>
        )}
        {mode === 'error' && (
          <div>
            <Button
              iconRight={IconType.LINK_EXTERNAL}
              variant="tertiary"
              size="sm"
              onClick={() => window.open(DetailsButtonSrc, '_blank')}
            >
              {DetailsButtonLabel}
            </Button>
          </div>
        )}
      </Wrapper>
    </Content>
  );
};

const IconContainer = styled.div.attrs({className: 'mr-1 mt-1'})``;

const Content = styled.div.attrs(() => ({
  className: `flex items-start gap-x-2 xl:gap-x-4`,
}))``;

const Wrapper = styled.div.attrs({
  className: 'flex flex-col justify-between h-full',
})``;

const Label = styled.div.attrs<{mode: StatusProps['mode']}>(({mode}) => ({
  className: `text-sm font-semibold leading-normal md:text-base ${textColors[mode]}`,
}))<{mode: StatusProps['mode']}>``;
