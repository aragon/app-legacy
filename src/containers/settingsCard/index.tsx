import React from 'react';
import styled from 'styled-components';

export const SettingsCard: React.FC<{title: string}> = ({title, children}) => {
  return (
    <Container>
      <Title>{title}</Title>
      <div>{children}</div>
    </Container>
  );
};

const Container = styled.div.attrs({
  className: 'py-2.5 px-2 space-y-2 bg-ui-0 rounded-xl border border-ui-100',
})``;

export const Title = styled.p.attrs({
  className: 'font-semibold text-ui-800 ft-text-xl',
})``;

export const Term = styled.dt.attrs({
  className: 'w-1/4 flex-grow flex-shrink-0 whitespace-nowrap' as string,
})``;

export const Definition = styled.dd.attrs({
  className: 'desktop:flex flex-shrink flex-grow-0' as string,
})`
  flex-basis: 75%;
`;

export const FlexibleDefinition = styled.dd.attrs({
  className: 'desktop:flex' as string,
})`
  flex-grow: 1;
`;

export const DescriptionPair = styled.div.attrs({
  className:
    'desktop:py-2 desktop:flex desktop:space-x-2 text-ui-600 border-b border-ui-100 ft-text-base' as string,
})``;
