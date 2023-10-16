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
    'flex flex-col p-2 pb-3 md:p-3 xl:p-5 bg-ui-0 gap-y-2 md:gap-y-3 md:rounded-xl md:border md:border-ui-100 md:shadow-100',
})``;

const TextContent = styled.div.attrs({
  className: 'md:flex-1 space-y-1 xl:space-y-2',
})``;

const Title = styled.h2.attrs({
  className: 'ft-text-3xl font-bold text-neutral-800',
})``;

const Description = styled.div.attrs({
  className: 'ft-text-lg text-neutral-600',
})``;

const ContentWrapper = styled.div.attrs({
  className:
    'flex flex-col md:flex-row gap-y-2 md:gap-x-6 md:items-start xl:items-center xl:mt-0 xl:pt-0',
})``;

const ButtonGroup = styled.div.attrs({
  className: 'flex flex-col-reverse md:flex-row gap-2',
})``;

const BreadcrumbWrapper = styled.div.attrs({
  className: 'xl:hidden xl:h-0 flex',
})``;
