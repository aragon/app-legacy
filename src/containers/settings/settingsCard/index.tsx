import React, {ReactNode} from 'react';
import styled from 'styled-components';

export const SettingsCard: React.FC<{title: string; children: ReactNode}> = ({
  title,
  children,
}) => {
  return (
    <Container>
      <Title>{title}</Title>
      <div>{children}</div>
    </Container>
  );
};

const Container = styled.div.attrs({
  className:
    'py-5 px-4 space-y-1 xl:space-y-4 bg-neutral-0 rounded-xl border border-neutral-100',
})``;

export const Title = styled.p.attrs({
  className: 'font-semibold text-neutral-800 ft-text-xl',
})``;

export const Term = styled.dt.attrs({
  className: `font-semibold xl:font-normal text-neutral-800 xl:text-neutral-600
    w-1/4 col-span-1 whitespace-nowrap` as string,
})``;

export const Definition = styled.dd.attrs({
  className:
    'xl:flex shrink grow-0 font-normal xl:font-semibold ft-text-base' as string,
})`
  flex-basis: 75%;
`;

export const FlexibleDefinition = styled.dd.attrs({
  className: 'xl:flex col-span-1' as string,
})`
  flex-grow: 1;
`;

export const DescriptionPair = styled.div.attrs({
  className: `space-y-0.5 py-1.5 md:py-4 xl:space-y-0 xl:flex
  xl:space-x-4 text-neutral-600 border-b border-neutral-100 ft-text-base md:grid grid-cols-2 gap-8` as string,
})``;
