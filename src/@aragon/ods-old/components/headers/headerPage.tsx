import React from 'react';
import {styled} from 'styled-components';
import {
  Breadcrumb,
  type BreadcrumbProps,
  type DefaultCrumbProps,
} from '../breadcrumb';
import {ButtonText, type ButtonTextProps} from '../button';

export type HeaderPageProps = {
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Primary action button properties */
  primaryBtnProps?: Omit<ButtonTextProps, 'mode' | 'size'>;
  /** Secondary action button properties */
  secondaryBtnProps?: Omit<ButtonTextProps, 'mode' | 'size' | 'bgWhite'>;
  /** Secondary action button properties */
  tertiaryBtnProps?: Omit<ButtonTextProps, 'mode' | 'size' | 'bgWhite'>;
  /** Breadcrumb properties */
  breadCrumbs: DefaultCrumbProps & NonNullable<Omit<BreadcrumbProps, 'tag'>>;
};

export const HeaderPage: React.FC<HeaderPageProps> = ({
  title,
  description,
  breadCrumbs,
  primaryBtnProps,
  secondaryBtnProps,
  tertiaryBtnProps,
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
          {tertiaryBtnProps && (
            <ButtonText {...tertiaryBtnProps} size="large" mode="ghost" />
          )}
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
    'flex flex-col p-4 pb-6 md:p-6 xl:p-10 bg-neutral-0 gap-y-4 md:gap-y-6 md:rounded-xl md:border md:border-neutral-100 md:shadow-neutral',
})``;

const TextContent = styled.div.attrs({
  className: 'md:flex-1 space-y-2 xl:space-y-4',
})``;

const Title = styled.h2.attrs({
  className: 'ft-text-3xl font-semibold text-neutral-800',
})``;

const Description = styled.div.attrs({
  className: 'ft-text-lg text-neutral-600',
})``;

const ContentWrapper = styled.div.attrs({
  className:
    'flex flex-col md:flex-row gap-y-4 md:gap-x-12 md:items-start xl:items-center xl:mt-0 xl:pt-0',
})``;

const ButtonGroup = styled.div.attrs({
  className: 'flex flex-col-reverse md:flex-row gap-4',
})``;

const BreadcrumbWrapper = styled.div.attrs({
  className: 'xl:hidden xl:h-0 flex',
})``;
