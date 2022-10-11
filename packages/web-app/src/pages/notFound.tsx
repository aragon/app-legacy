import React from 'react';
import styled from 'styled-components';
import {withTransaction} from '@elastic/apm-rum-react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {ButtonText, IconChevronRight, Link} from '@aragon/ui-components';

import {Container, GridLayout} from 'components/layout';
import Logo from 'public/logoBlue.svg';
import Logo404 from 'public/illu-custom.svg';
import Green from 'public/circleGreenGradient.svg';
import Purple from 'public/purpleGradient.svg';
import {CreateDAO, Landing} from 'utils/paths';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const {t} = useTranslation();

  return (
    <div className="overflow-x-hidden">
      <Container>
        <div className="hidden desktop:block py-2 desktop:py-4">
          <GridLayout>
            <img
              className="col-span-2 h-4 cursor-pointer"
              src={Logo}
              onClick={() => window.open('https://aragon.org/', '_blank')}
            />
          </GridLayout>
        </div>
      </Container>

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

          <div className="relative mt-2 desktop:-mt-8 desktop:w-1/2">
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

        <HStack>
          <Card
            description={t('cta.404.findOut')}
            linkLabel={t('cta.404.findOutActionLabel')}
            href="https://aragon.org/aragon-app"
          />
          <Card
            description={t('cta.404.create')}
            linkLabel={t('cta.404.createActionLabel')}
            onClick={() => navigate(CreateDAO)}
          />
          <Card
            description={t('cta.404.learn')}
            linkLabel={t('cta.404.learnActionLabel')}
            href="https://aragon.org/how-to"
          />
        </HStack>
      </GridLayout>
    </div>
  );
};

export default withTransaction('NotFound', 'component')(NotFound);

type CardProps = {
  description: string;
  linkLabel: string;
  href?: string;
  onClick?: () => void;
};

const Card: React.FC<CardProps> = ({description, linkLabel, href, onClick}) => (
  <CardContainer>
    <p className="text-ui-600">{description}</p>
    <Link
      label={linkLabel}
      iconRight={<IconChevronRight />}
      href={href}
      onClick={onClick}
    />
  </CardContainer>
);

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

const HStack = styled.div.attrs({
  className:
    'desktop:flex col-span-full desktop:col-start-2 desktop:col-end-12 desktop:mt-14 space-y-3 desktop:space-y-0 desktop:space-x-3 pb-3',
})``;

const CardContainer = styled.div.attrs({
  className:
    'flex-1 p-2 desktop:p-3 space-y-1.5 bg-white rounded-xl border border-ui-100',
})`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;
