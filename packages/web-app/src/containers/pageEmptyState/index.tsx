import React from 'react';
import styled from 'styled-components';

import {ButtonText} from '@aragon/ui-components';

type PageEmptyStateProps = {
  title: string;
  subtitle: string;
  onClick?: () => void;
  buttonLabel: string;
  Illustration: JSX.Element;
};

const PageEmptyState = ({
  title,
  subtitle,
  Illustration,
  onClick,
  buttonLabel,
}: PageEmptyStateProps) => {
  return (
    <>
      <Container>
        <EmptyStateContainer>
          {Illustration}
          <EmptyStateHeading>{title}</EmptyStateHeading>

          <span
            className="mt-1.5 lg:w-1/2 text-center"
            dangerouslySetInnerHTML={{__html: subtitle || ''}}
          ></span>
          <ButtonText
            size="large"
            label={buttonLabel}
            className="mt-4"
            onClick={onClick}
          />
        </EmptyStateContainer>
      </Container>
    </>
  );
};

export default PageEmptyState;

export const Container = styled.div.attrs({
  className: 'col-span-full desktop:col-start-3 desktop:col-end-11',
})``;

export const EmptyStateHeading = styled.h1.attrs({
  className: 'mt-4 ft-text-2xl font-bold text-ui-800 text-center',
})``;

export const EmptyStateContainer = styled.div.attrs({
  className:
    'flex flex-col w-full items-center py-4 px-3 tablet:py-12 tablet:px-6 mx-auto mt-3 tablet:mt-5 ft-text-lg bg-white rounded-xl text-ui-500',
})``;
