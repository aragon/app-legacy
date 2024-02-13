import React, {ButtonHTMLAttributes} from 'react';
import styled from 'styled-components';

import {IButtonBaseProps} from '@aragon/ods/dist/types/src/components/button/button.api';
import {Button} from '@aragon/ods';

type PageEmptyStateProps = {
  title: string;
  subtitle: string;
  Illustration: JSX.Element;
  primaryButton: Omit<
    IButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement>,
    'variant' | 'size'
  >;
  secondaryButton?: Omit<
    IButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement>,
    'variant' | 'size'
  >;
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
            className="mt-3 text-center lg:w-1/2"
            dangerouslySetInnerHTML={{__html: subtitle || ''}}
          ></span>
          <ActionsContainer>
            <Button {...primaryButton} variant="primary" size="lg" />
            {secondaryButton && (
              <Button {...secondaryButton} variant="secondary" size="lg" />
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
  className: 'mt-8 ft-text-2xl font-semibold text-neutral-800 text-center',
})``;

export const EmptyStateContainer = styled.div.attrs({
  className:
    'flex flex-col w-full items-center py-8 px-6 md:py-24 md:px-12 mx-auto mt-6 md:mt-10 ft-text-lg bg-neutral-0 rounded-xl text-neutral-500',
})``;

const ActionsContainer = styled.div.attrs({
  className:
    'flex flex-col md:flex-row md:gap-x-6 gap-y-3 md:justify-center mt-8 w-full',
})``;
