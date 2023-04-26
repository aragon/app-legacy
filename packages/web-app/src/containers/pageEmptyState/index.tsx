import React from 'react';
import styled from 'styled-components';

import {htmlIn} from 'utils/htmlIn';
import {ButtonText} from '@aragon/ui-components';
import {useTranslation} from 'react-i18next';

type PageEmptyStateProps = {
  title: string;
  subtitle: TemplateStringsArray;
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
  const {t} = useTranslation();

  return (
    <>
      <Container>
        <EmptyStateContainer>
          {Illustration}
          <EmptyStateHeading>{title}</EmptyStateHeading>
          <span
            className="mt-1.5 lg:w-1/2 text-center"
            dangerouslySetInnerHTML={{
              __html: htmlIn(t)(subtitle),
            }}
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
  className: 'mt-4 text-2xl font-bold text-ui-800 text-center',
})``;

export const EmptyStateContainer = styled.div.attrs({
  className:
    'flex flex-col w-full items-center py-4 px-3 tablet:py-12 tablet:px-6 mx-auto mt-3 tablet:mt-5 text-lg bg-white rounded-xl text-ui-500',
})``;
