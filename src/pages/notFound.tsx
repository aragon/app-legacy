import React from 'react';
import styled from 'styled-components';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {Container, GridLayout} from 'components/layout';
import Logo404 from 'assets/images/illu-custom.svg';
import Green from 'assets/images/circleGreenGradient.svg';
import Purple from 'assets/images/purpleGradient.svg';
import {Landing} from 'utils/paths';
import {Button} from '@aragon/ods';
import {Logotype} from 'components/logos/logotype';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const {t} = useTranslation();

  return (
    <>
      <Container>
        <Menu>
          <GridLayout>
            <LeftContent>
              <LogoContainer href="/">
                <Logotype />
              </LogoContainer>
            </LeftContent>
          </GridLayout>
        </Menu>
      </Container>

      <div className="overflow-x-hidden xl:overflow-x-visible">
        <GridLayout>
          <Wrapper>
            <div className="mt-6 xl:mt-0 xl:w-1/2">
              <Title>
                {t('cta.404.titleLine1')}
                <br />
                {t('cta.404.titleLine2')}
              </Title>
              <Button
                size="lg"
                variant="primary"
                className="mt-10 hidden xl:block"
                onClick={() => navigate(Landing)}
              >
                {t('cta.404.backToExplore')}
              </Button>
            </div>

            <div className="relative mt-4 xl:mt-0 xl:w-1/2">
              <GradientGreen src={Green} />
              <GradientPurple src={Purple} />
              <img src={Logo404} className="w-full" />
            </div>
          </Wrapper>
        </GridLayout>

        <GridLayout>
          <div className="col-span-full">
            <Button
              size="lg"
              variant="primary"
              className="mt-28 block w-full xl:mt-0 xl:hidden"
              onClick={() => navigate(Landing)}
            >
              {t('cta.404.backToExplore')}
            </Button>
          </div>
        </GridLayout>
      </div>
    </>
  );
};

const LeftContent = styled.div.attrs({
  className: 'col-span-2 flex items-center',
})``;

const LogoContainer = styled.a.attrs({
  className: 'h-10 text-primary-400',
})``;

const Menu = styled.nav.attrs({
  className: 'py-4 xl:py-8',
})`
  background: linear-gradient(
    180deg,
    rgba(245, 247, 250, 1) 0%,
    rgba(245, 247, 250, 0) 100%
  );
  backdrop-filter: blur(24px);
`;

const Wrapper = styled.div.attrs({
  className:
    'xl:flex justify-center items-end xl:justify-between col-span-full xl:col-start-2 xl:col-end-12 relative',
})``;

const Title = styled.h1.attrs({
  className: 'font-semibold text-primary-500 text-center xl:text-left',
})`
  font-family: Syne;
  line-height: 120%;
  font-size: 34px;

  @media (min-width: 1024px) {
    font-size: 61px;
  }
`;

const GradientGreen = styled.img.attrs({
  className: 'h-[200px] xl:h-80 absolute -left-20 xl:-left-28 top-16',
})``;

const GradientPurple = styled.img.attrs({
  className: 'h-[200px] xl:h-80 absolute -bottom-16 -right-24',
})``;
