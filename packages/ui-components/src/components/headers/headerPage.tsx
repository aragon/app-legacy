import styled from 'styled-components';
import React from 'react';
import {ButtonText, ButtonTextProps} from '../button';
import {Breadcrumb, DefaultCrumbProps, BreadcrumbProps} from '../breadcrumb';

export type HeaderPageProps = {
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Primary action button properties */
  primaryBtnProps?: Omit<ButtonTextProps, 'mode' | 'size'>;
  /** Secondary action button properties */
  secondaryBtnProps?: Omit<ButtonTextProps, 'mode' | 'size' | 'bgWhite'>;
  /** Breadcrumb properties */
  breadCrumbs: DefaultCrumbProps & NonNullable<Omit<BreadcrumbProps, 'tag'>>;
};

export const HeaderPage: React.FC<HeaderPageProps> = ({
  title,
  description,
  breadCrumbs,
  primaryBtnProps,
  secondaryBtnProps,
}) => {
  return (
    <Card data-testid="header-page">
      <BreadcrumbWrapper>
        <Breadcrumb {...breadCrumbs} />
      </BreadcrumbWrapper>
      <ContentWrapper>
        <TextContent>
          <Title>{title}</Title>
          <Description>{description}</Description>
        </TextContent>
        {/* Mode,size, bgWhite should not be changed, adding after spread to override */}
        <ButtonGroup>
          {secondaryBtnProps && (
            <ButtonText
              {...secondaryBtnProps}
              size="large"
              mode="secondary"
              bgWhite
            />
          )}
          {primaryBtnProps && (
            <ButtonText {...primaryBtnProps} mode="primary" size="large" />
          )}
        </ButtonGroup>
      </ContentWrapper>
    </Card>
  );
};

const Card = styled.div.attrs({
  className:
    'flex flex-col p-2 pb-3 tablet:p-3 desktop:p-5 bg-ui-0 gap-y-2 tablet:gap-y-3 tablet:rounded-xl tablet:border tablet:border-ui-100 tablet:shadow-100',
})``;

const TextContent = styled.div.attrs({
  className: 'tablet:flex-1 space-y-1 desktop:space-y-2',
})``;

const Title = styled.h2.attrs({
  className: 'ft-text-3xl font-bold text-ui-800',
})``;

const Description = styled.div.attrs({
  className: 'ft-text-lg text-ui-600',
})``;

const ContentWrapper = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-row gap-y-2 tablet:gap-x-6 tablet:items-start desktop:items-center desktop:mt-0 desktop:pt-0',
})``;

const ButtonGroup = styled.div.attrs({
  className: 'flex flex-col-reverse tablet:flex-row gap-2',
})``;

const BreadcrumbWrapper = styled.div.attrs({
  className: 'desktop:hidden desktop:h-0 flex',
})``;
