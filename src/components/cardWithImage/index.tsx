import React from 'react';
import styled from 'styled-components';

type CardWithImageProps = {
  imgSrc: React.ReactNode;
  caption: string;
  title: string;
  subtitle?: string;
};

const CardWithImage: React.FC<CardWithImageProps> = ({
  imgSrc,
  caption,
  title,
  subtitle,
}) => {
  return (
    <Container>
      <ImageContainer>{imgSrc}</ImageContainer>
      <VStack>
        <Caption>{caption}</Caption>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
      </VStack>
    </Container>
  );
};

export default CardWithImage;

const Container = styled.div.attrs({
  className: 'flex-1 p-6 rounded-xl bg-neutral-0 mx-2 mb-6 xl:m-0',
})``;

const ImageContainer = styled.div.attrs({
  className: 'mb-4 rounded-xl flex justify-center bg-neutral-50',
})``;

const VStack = styled.div.attrs({
  className: 'space-y-0.25',
})``;

const Caption = styled.div.attrs({
  className: 'text-sm text-neutral-500',
})``;

const Title = styled.div.attrs({
  className: 'font-semibold text-neutral-800',
})``;

const Subtitle = styled.div.attrs({
  className: 'text-sm text-neutral-600',
})``;
