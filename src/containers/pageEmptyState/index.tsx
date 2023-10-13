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
  className: 'col-span-full desktop:col-start-3 desktop:col-end-11',
})``;

export const EmptyStateHeading = styled.h1.attrs({
  className: 'mt-4 ft-text-2xl font-bold text-ui-800 text-center',
})``;

export const EmptyStateContainer = styled.div.attrs({
  className:
    'flex flex-col w-full items-center py-4 px-3 tablet:py-12 tablet:px-6 mx-auto mt-3 tablet:mt-5 ft-text-lg bg-white rounded-xl text-ui-500',
})``;

const ActionsContainer = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-row tablet:gap-x-3 gap-y-1.5 tablet:justify-center mt-4 w-full',
})``;
