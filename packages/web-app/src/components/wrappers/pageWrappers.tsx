import React from 'react';
import styled from 'styled-components';
import {useNavigate} from 'react-router-dom';
import {
  Badge,
  Breadcrumb,
  ButtonText,
  IconAdd,
  IconType,
} from '@aragon/ui-components';

import useScreen from 'hooks/useScreen';
import {SectionWrapperProps} from './sectionWrappers';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';

type ChangeSign = -1 | 0 | 1;

export type PageWrapperProps = SectionWrapperProps & {
  buttonLabel: string;
  buttonIcon?: React.FunctionComponentElement<IconType>;
  subtitle?: string;
  timePeriod?: string;
  sign?: number;
  onClick?: () => void;
};

const textColors: Record<ChangeSign, string> = {
  '-1': 'text-critical-800',
  '1': 'text-success-600',
  '0': 'text-ui-600',
};

/**
 * Non proposal page wrapper. Consists of a header with a title and a
 * icon button.
 */
export const PageWrapper = ({
  title,
  children,
  buttonLabel,
  buttonIcon,
  timePeriod,
  sign = 0,
  subtitle,
  showButton = true,
  onClick,
}: PageWrapperProps) => {
  const {isDesktop} = useScreen();
  const navigate = useNavigate();
  const {breadcrumbs, icon, tag} = useMappedBreadcrumbs();

  return (
    <div className="col-span-full desktop:col-start-3 desktop:col-end-11">
      <HeaderContainer className="-mx-2 tablet:mx-0 tablet:mt-3">
        {!isDesktop && (
          <Breadcrumb
            icon={icon}
            crumbs={breadcrumbs}
            onClick={navigate}
            tag={tag}
          />
        )}
        <ContentWrapper>
          <TextWrapper>
            <PageTitle>{title}</PageTitle>
            {subtitle && (
              <PageSubtitleContainer>
                {timePeriod && <Badge label={timePeriod} />}
                <p className={textColors[sign as ChangeSign]}>{subtitle}</p>
              </PageSubtitleContainer>
            )}
          </TextWrapper>

          {showButton && (
            <ButtonText
              size="large"
              label={buttonLabel}
              iconLeft={buttonIcon || <IconAdd />}
              className="w-full tablet:w-auto"
              onClick={onClick}
            />
          )}
        </ContentWrapper>
      </HeaderContainer>

      {children}
    </div>
  );
};

const PageSubtitleContainer = styled.div.attrs({
  className: 'flex gap-x-1.5 items-center mt-1 text-lg text-ui-600',
})``;

const TextWrapper = styled.div.attrs({
  className: 'tablet:flex-1',
})``;

const HeaderContainer = styled.div.attrs({
  className:
    'flex flex-col gap-y-2 tablet:gap-y-3 desktop:p-0 px-2 tablet:px-3 pt-2' +
    ' desktop:pt-0 pb-3 bg-ui-0 desktop:bg-transparent' +
    ' tablet:rounded-xl desktop:rounded-none',
})``;

const PageTitle = styled.p.attrs({
  className: 'text-3xl font-bold text-ui-800 ft-text-3xl',
})``;

const ContentWrapper = styled.div.attrs({
  className:
    'tablet:flex tablet:justify-between tablet:items-start' +
    ' space-y-2 tablet:space-y-0 tablet:space-x-3',
})``;
