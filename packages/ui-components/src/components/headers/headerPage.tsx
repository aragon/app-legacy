import styled from 'styled-components';
import React from 'react';
import {ButtonText} from '../button';
import {IconType} from '../icons';
import {Breadcrumb, DefaultCrumbProps, BreadcrumbProps} from '../breadcrumb';

export type HeaderPageProps = DefaultCrumbProps &
  Pick<BreadcrumbProps, 'tag'> & {
    title: string;
    description: string;
    buttonLabel?: string;
    buttonIcon?: React.FunctionComponentElement<IconType>;
    secondaryButtonLabel?: string;
    secondaryButtonIcon?: React.FunctionComponentElement<IconType>;
    onClick?: () => void;
    onCrumbClick?: () => void;
    secondaryOnClick?: () => void;
  };

export const HeaderPage: React.FC<HeaderPageProps> = ({
  title,
  description,
  buttonLabel,
  buttonIcon,
  secondaryButtonLabel,
  secondaryButtonIcon,
  crumbs,
  icon,
  tag,
  onClick,
  onCrumbClick,
  secondaryOnClick,
}) => {
  return (
    <Card data-testid="page-dao">
      <BreadcrumbWrapper>
        <Breadcrumb {...{icon, crumbs, tag}} onClick={onCrumbClick} />
      </BreadcrumbWrapper>
      <ContentWrapper>
        <Content>
          <Title>{title}</Title>
          <Description>{description}</Description>
        </Content>
        <ActionWrapper>
          {secondaryButtonLabel && (
            <ButtonText
              label={secondaryButtonLabel}
              iconLeft={secondaryButtonIcon}
              size="large"
              mode="ghost"
              onClick={secondaryOnClick}
            />
          )}
          {buttonLabel && (
            <ButtonText
              label={buttonLabel}
              iconLeft={buttonIcon}
              size="large"
              onClick={onClick}
            />
          )}
        </ActionWrapper>
      </ContentWrapper>
    </Card>
  );
};

const Card = styled.div.attrs({
  className:
    'flex flex-col p-2 pb-3 tablet:p-3 desktop:p-5 bg-ui-0 gap-y-2 tablet:gap-y-3 tablet:rounded-xl tablet:border tablet:border-ui-100 tablet:shadow-100',
})``;

const Content = styled.div.attrs({
  className: 'tablet:flex-1 space-y-1 desktop:space-y-2 capitalize',
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

const ActionWrapper = styled.div.attrs({
  className: 'flex flex-col tablet:flex-row gap-2',
})``;

const BreadcrumbWrapper = styled.div.attrs({
  className: 'desktop:hidden desktop:h-0 flex',
})``;
