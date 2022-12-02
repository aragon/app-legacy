import {HeaderPage, HeaderPageProps} from '@aragon/ui-components';
import React from 'react';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';

export type PageWrapperProps = Omit<
  HeaderPageProps,
  'breadCrumbs' | 'description' | 'title'
> & {
  children?: React.ReactNode;
  customHeader?: React.ReactNode;
  customBody?: React.ReactNode;
  description?: string;
  title?: string;
};

export const PageWrapper: React.FC<PageWrapperProps> = ({title, ...props}) => {
  const navigate = useNavigate();
  const {breadcrumbs: crumbs, icon} = useMappedBreadcrumbs();

  return (
    <>
      {props.customHeader || (
        <HeaderContainer>
          <HeaderPage
            {...props}
            title={title || ''}
            breadCrumbs={{crumbs, icon, onClick: navigate}}
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
