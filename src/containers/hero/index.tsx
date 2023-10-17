import React from 'react';
import styled from 'styled-components';
import Logo from 'public/coloredLogo.svg';
import Green from 'public/circleGreenGradient.svg';
import Purple from 'public/purpleGradient.svg';
import {useTranslation} from 'react-i18next';
import {GridLayout} from 'components/layout';

function Hero() {
  const {t} = useTranslation();
  return (
    <Container>
      <GridLayout>
        <Wrapper>
          <ContentWrapper>
            <Title>{t('explore.hero.title')}</Title>
            <Subtitle>{t('explore.hero.subtitle1')}</Subtitle>
          </ContentWrapper>
          <ImageWrapper>
            <StyledImage src={Logo} />
          </ImageWrapper>
          <GradientContainer>
            <GradientWrapper>
              <GradientGreen src={Green} />
              <GradientPurple src={Purple} />
            </GradientWrapper>
          </GradientContainer>
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
  className:
    'bg-primary-400 h-[448px] -mt-20 pt-20  xl:h-[536px] xl:pt-24 xl:-mt-24 overflow-hidden',
})``;

const Wrapper = styled.div.attrs({
  className:
    'flex justify-center xl:justify-between col-span-full xl:col-start-2 xl:col-end-12 relative',
})``;

const ContentWrapper = styled.div.attrs({
  className: 'xl:space-y-0.75 space-y-2 max-w-lg pt-9 xl:pt-20',
})``;

const Title = styled.h1.attrs({
  className:
    'text-neutral-0 font-semibold ft-text-5xl xl:text-left text-center xl:leading-7.5 leading-4.5',
})`
  font-family: Syne;
  letter-spacing: -0.03em;
`;

const Subtitle = styled.h3.attrs({
  className:
    'text-neutral-0 ft-text-lg font-normal text-center xl:text-left leading-3 xl:leading-3.75',
})``;

const ImageWrapper = styled.div.attrs({
  className: 'h-full',
})``;

const StyledImage = styled.img.attrs({
  className: 'w-[568px] hidden xl:block',
})``;

const GradientContainer = styled.div.attrs({
  className: 'absolute top-64 xl:top-40 right-0 w-[568px]',
})``;

const GradientWrapper = styled.div.attrs({
  className: 'relative w-full h-full',
})``;

const GradientGreen = styled.img.attrs({
  className: 'h-80 absolute xl:-left-28 xl:-top-40 -top-[152px] left-28',
})``;

const GradientPurple = styled.img.attrs({
  className: 'xl:h-80 h-60 absolute xl:-right-40 xl:top-10 -right-10 -top-12',
})``;

export default Hero;
