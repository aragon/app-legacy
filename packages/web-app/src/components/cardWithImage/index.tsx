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
  className: 'flex-1 p-3 rounded-xl bg-ui-0 mx-1 mb-3 desktop:m-0',
})``;

const ImageContainer = styled.div.attrs({
  className: 'mb-2 rounded-xl flex justify-center bg-ui-50',
})``;

const VStack = styled.div.attrs({
  className: 'space-y-0.25',
})``;

const Caption = styled.div.attrs({
  className: 'text-sm text-ui-500',
})``;

const Title = styled.div.attrs({
  className: 'font-bold text-ui-800',
})``;

const Subtitle = styled.div.attrs({
  className: 'text-sm text-ui-600',
})``;
