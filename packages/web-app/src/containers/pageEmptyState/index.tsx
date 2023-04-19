import React from 'react';
import styled from 'styled-components';

import {htmlIn} from 'utils/htmlIn';
import {ButtonText, IconAdd} from '@aragon/ui-components';
import {useTranslation} from 'react-i18next';

type PageEmptyStateProps = {
  title: string;
  subtitle: string;
  src: string;
  onClick?: () => void;
  buttonLabel: string;
};

const PageEmptyState = ({
  title,
  subtitle,
  src,
  onClick,
  buttonLabel,
}: PageEmptyStateProps) => {
  const {t} = useTranslation();

  return (
    <>
      <Container>
        <EmptyStateContainer>
          <ImageContainer {...{src}} />
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
            iconLeft={<IconAdd />}
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

const ImageContainer = styled.img.attrs({
  className: 'object-cover w-1/2',
})``;

export const EmptyStateHeading = styled.h1.attrs({
  className: 'mt-4 text-2xl font-bold text-ui-800 text-center',
})``;

export const EmptyStateContainer = styled.div.attrs({
  className:
    'flex flex-col w-full items-center py-4 px-3 tablet:py-12 tablet:px-6 mx-auto mt-3 tablet:mt-5 text-lg bg-white rounded-xl text-ui-500',
})``;
