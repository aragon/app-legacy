import {HeaderPage, HeaderPageProps} from '@aragon/ods-old';
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
  includeHeader?: boolean;
};

export const PageWrapper: React.FC<PageWrapperProps> = ({
  title,
  includeHeader = true,
  ...props
}) => {
  const navigate = useNavigate();
  const {breadcrumbs: crumbs, icon} = useMappedBreadcrumbs();

  return (
    <>
      {includeHeader &&
        (props.customHeader || (
          <HeaderContainer>
            <HeaderPage
              {...props}
              title={title || ''}
              breadCrumbs={{crumbs, icon, onClick: navigate}}
            />
          </HeaderContainer>
        ))}

      {props.customBody || <BodyContainer>{props.children}</BodyContainer>}
    </>
  );
};

const HeaderContainer = styled.div.attrs({
  className:
    'col-span-full xl:col-start-2 xl:col-end-12 -mx-2 md:mx-0 md:mt-3 xl:mt-10',
})``;

const BodyContainer = styled.div.attrs({
  className: 'col-span-full xl:col-start-3 xl:col-end-11',
})``;
