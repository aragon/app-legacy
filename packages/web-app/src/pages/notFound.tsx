import React from 'react';
import styled from 'styled-components';
import {withTransaction} from '@elastic/apm-rum-react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {ButtonText} from '@aragon/ui-components';

import {Container, GridLayout} from 'components/layout';
import Logo from 'public/logoBlue.svg';
import Logo404 from 'public/illu-custom.svg';
import Green from 'public/circleGreenGradient.svg';
import Purple from 'public/purpleGradient.svg';
import {Landing} from 'utils/paths';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const {t} = useTranslation();

  return (
    <>
      <Container>
        <Menu>
          <GridLayout>
            <img
              className="col-span-2 col-start-2 tablet:col-start-4 desktop:col-start-auto mx-auto desktop:mx-0 h-4"
              src={Logo}
            />
          </GridLayout>
        </Menu>
      </Container>

      <div className="overflow-x-hidden desktop:overflow-x-visible">
        <GridLayout>
          <Wrapper>
            <div className="mt-3 desktop:mt-0 desktop:w-1/2">
              <Title>
                {t('cta.404.titleLine1')}
                <br />
                {t('cta.404.titleLine2')}
              </Title>
              <ButtonText
                label={t('cta.404.backToExplore')}
                size="large"
                className="hidden desktop:block mt-5"
                onClick={() => navigate(Landing)}
              />
            </div>

            <div className="relative mt-2 desktop:mt-0 desktop:w-1/2">
              <GradientGreen src={Green} />
              <GradientPurple src={Purple} />
              <img src={Logo404} className="w-full" />
            </div>
          </Wrapper>
        </GridLayout>

        <GridLayout>
          <div className="col-span-full">
            <ButtonText
              label={t('cta.404.backToExplore')}
              size="large"
              className="block desktop:hidden mt-14 desktop:mt-0 w-full"
              onClick={() => navigate(Landing)}
            />
          </div>
        </GridLayout>
      </div>
    </>
  );
};

export default withTransaction('NotFound', 'component')(NotFound);

const Menu = styled.nav.attrs({
  className: 'py-2 desktop:py-4',
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
    'desktop:flex justify-center items-end desktop:justify-between col-span-full desktop:col-start-2 desktop:col-end-12 relative',
})``;

const Title = styled.h1.attrs({
  className: 'font-bold text-primary-500 text-center desktop:text-left',
})`
  font-family: Syne;
  line-height: 120%;
  font-size: 34px;

  @media (min-width: 1024px) {
    font-size: 61px;
  }
`;

const GradientGreen = styled.img.attrs({
  className: 'h-25 desktop:h-40 absolute -left-10 desktop:-left-14 top-8',
})``;

const GradientPurple = styled.img.attrs({
  className: 'h-25 desktop:h-40 absolute -bottom-8 -right-12',
})``;
