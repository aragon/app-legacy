import {HeaderPage, HeaderPageProps} from '@aragon/ui-components';
import React from 'react';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';

export type PageWrapperProps = Omit<
  HeaderPageProps,
  'tag' | 'icon' | 'crumbs' | 'onCrumbClick' | 'title' | 'description'
> & {
  title?: string;
  children?: React.ReactNode;
  description?: string;
  customHeader?: React.ReactNode;
  customBody?: React.ReactNode;
};

export const PageWrapper: React.FC<PageWrapperProps> = props => {
  const navigate = useNavigate();
  const {breadcrumbs, icon, tag} = useMappedBreadcrumbs();

  return (
    <>
      {props.customHeader || (
        <HeaderContainer>
          <HeaderPage
            tag={tag}
            icon={icon}
            crumbs={breadcrumbs}
            onCrumbClick={navigate}
            title={props.title || ''}
            description={props.description || ''}
            buttonLabel={props.buttonLabel}
            onClick={props.onClick}
            buttonIcon={props.buttonIcon}
            secondaryButtonLabel={props.secondaryButtonLabel}
            secondaryButtonIcon={props.secondaryButtonIcon}
            secondaryOnClick={props.secondaryOnClick}
          />
        </HeaderContainer>
      )}

      {props.customBody || <BodyContainer>{props.children}</BodyContainer>}
    </>
  );
};

const HeaderContainer = styled.div.attrs({
  className:
    'col-span-full desktop:col-start-2 desktop:col-end-12 -mx-2 tablet:mx-0 tablet:mt-3 desktop:mt-5',
})``;

const BodyContainer = styled.div.attrs({
  className: 'col-span-full desktop:col-start-3 desktop:col-end-11',
})``;
