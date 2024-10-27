import React from 'react';
import styled from 'styled-components';
import Blueprint from 'assets/images/blueprintTexture.svg';
import {useTranslation} from 'react-i18next';
import {GridLayout} from 'components/layout';

function Hero() {
  const {t} = useTranslation();
  return (
    <Container>
      <StyledImage src={Blueprint} alt="Background Texture" />
      <GridLayout>
        <Wrapper>
          <ContentWrapper>
            <Title>{t('explore.hero.title')}</Title>
            <Subtitle>{t('explore.hero.subtitle1')}</Subtitle>
          </ContentWrapper>
          <ImageWrapper></ImageWrapper>
        </Wrapper>
      </GridLayout>
    </Container>
  );
}

// NOTE: "h-[448px] -mt-20 pt-20" is the "simplest" way to achieve a sticky header
// with a gradient AND a primary 400 background. What it does it is extends the
// hero by a height of 12, moves it up using the negative margin and compensates
// by lowering the content using the padding-top. Same with factor 12 on
// desktop.
const Container = styled.div.attrs({
  className: 'relative bg-primary-400 xl:pt-24 xl:-mt-24 overflow-hidden',
})``;

const Wrapper = styled.div.attrs({
  className: 'flex relative w-full col-start-1 xl:col-start-2 col-end-12',
})``;

const ContentWrapper = styled.div.attrs({
  className: 'flex flex-col space-y-4 py-16 max-w-[720px]',
})``;

const Title = styled.h1.attrs({
  className: 'text-neutral-0  ft-text-4xl xl:text-left',
})`
  font-family: Sora;
  letter-spacing: -0.03em;
`;

const Subtitle = styled.h3.attrs({
  className:
    'text-neutral-0 ft-text-lg font-normal leading-[24px] xl:leading-[30px]',
})``;

const ImageWrapper = styled.div.attrs({
  className: 'h-full',
})``;

const StyledImage = styled.img.attrs({
  className: 'absolute top-0 left-0 w-full h-full object-cover',
})``;

export default Hero;
