import styled from 'styled-components';
import React from 'react';
import {ButtonText} from '../button';
import {IconAdd, IconLinkExternal} from '../icons';
import {Breadcrumb, DefaultCrumbProps, BreadcrumbProps} from '../breadcrumb';

export type HeaderPageProps = DefaultCrumbProps &
  Pick<BreadcrumbProps, 'tag'> & {
    title: string;
    description: string;
    buttonLabel: string;
    secondaryButtonLabel?: string;
    onClick?: () => void;
    secondaryOnClick?: () => void;
  };

export const HeaderPage: React.FC<HeaderPageProps> = ({
  title,
  description,
  buttonLabel,
  secondaryButtonLabel,
  crumbs,
  icon,
  tag,
  onClick,
  secondaryOnClick,
}) => {
  return (
    <Card data-testid="page-dao">
      <BreadcrumbWrapper>
        <Breadcrumb {...{icon, crumbs, tag}} />
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
              iconLeft={<IconLinkExternal />}
              size="large"
              mode="ghost"
              onClick={secondaryOnClick}
            />
          )}
          <ButtonText
            label={buttonLabel}
            iconLeft={<IconAdd />}
            size="large"
            onClick={onClick}
          />
        </ActionWrapper>
      </ContentWrapper>
    </Card>
  );
};

const Card = styled.div.attrs({
  className:
    'w-full bg-white tablet:rounded-xl p-2 tablet:p-3 desktop:p-5 border border-ui-100 desktop:space-y-0 tablet:space-3 space-y-2',
})`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const Content = styled.div.attrs({
  className: 'space-y-1 desktop:space-y-2',
})``;

const Title = styled.h2.attrs({
  className: 'ft-text-3xl font-bold text-ui-800',
})``;

const Description = styled.div.attrs({
  className: 'ft-text-lg text-ui-600',
})``;

const ContentWrapper = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-row justify-between desktop:items-center space-y-2 tablet:space-y-0',
})``;

const ActionWrapper = styled.div.attrs({
  className: 'flex space-x-2',
})``;

const BreadcrumbWrapper = styled.div.attrs({
  className: 'desktop:hidden flex',
})``;
