import React, {ReactNode} from 'react';
import styled from 'styled-components';
import {
  Spinner,
  IconRadioCancel,
  IconSuccess,
  ButtonText,
  IconLinkExternal,
  Tag,
} from '@aragon/ods-old';

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
        <Icon mode={mode} />
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
              <Tag key={index} label={item} colorScheme={'critical'} />
            ))}
          </div>
        )}
        {mode === 'error' && (
          <div>
            <ButtonText
              label={DetailsButtonLabel as string}
              iconRight={<IconLinkExternal />}
              mode="secondary"
              size="small"
              bgWhite
              onClick={() => window.open(DetailsButtonSrc, '_blank')}
            />
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
