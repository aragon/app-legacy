import React from 'react';
import styled from 'styled-components';

import {ButtonText, ButtonTextProps} from '@aragon/ods-old';

type PageEmptyStateProps = {
  title: string;
  subtitle: string;
  Illustration: JSX.Element;
  primaryButton: Omit<ButtonTextProps, 'mode' | 'size'>;
  secondaryButton?: Omit<ButtonTextProps, 'mode' | 'size'>;
};

const PageEmptyState = ({
  title,
  subtitle,
  Illustration,
  primaryButton,
  secondaryButton,
}: PageEmptyStateProps) => {
  return (
    <>
      <Container>
        <EmptyStateContainer>
          {Illustration}
          <EmptyStateHeading>{title}</EmptyStateHeading>

          <span
            className="mt-1.5 text-center lg:w-1/2"
            dangerouslySetInnerHTML={{__html: subtitle || ''}}
          ></span>
          <ActionsContainer>
            <ButtonText {...primaryButton} mode="primary" size="large" />
            {secondaryButton && (
              <ButtonText
                {...secondaryButton}
                bgWhite={true}
                mode="secondary"
                size="large"
              />
            )}
          </ActionsContainer>
        </EmptyStateContainer>
      </Container>
    </>
  );
};

export default PageEmptyState;

const Container = styled.div.attrs({
  className: 'col-span-full xl:col-start-3 xl:col-end-11',
})``;

export const EmptyStateHeading = styled.h1.attrs({
  className: 'mt-4 ft-text-2xl font-semibold text-neutral-800 text-center',
})``;

export const EmptyStateContainer = styled.div.attrs({
  className:
    'flex flex-col w-full items-center py-4 px-3 md:py-24 md:px-12 mx-auto mt-3 md:mt-10 ft-text-lg bg-neutral-0 rounded-xl text-neutral-500',
})``;

const ActionsContainer = styled.div.attrs({
  className:
    'flex flex-col md:flex-row md:gap-x-3 gap-y-1.5 md:justify-center mt-4 w-full',
})``;
