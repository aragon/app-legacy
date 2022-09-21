import React from 'react';
import styled from 'styled-components';

import IconLogo from 'public/iconLogo.svg';
import Green from 'public/greenGradient.svg';
import Purple from 'public/purpleGradient.svg';
import {EXPLORE_NAV_LINKS, PRIVACY_NAV_LINKS} from 'utils/constants';
import {GridLayout} from 'components/layout';
import useScreen from 'hooks/useScreen';
import {Link} from '@aragon/ui-components';

const Footer: React.FC = () => {
  const {isDesktop} = useScreen();

  const ExploreNavLinks = EXPLORE_NAV_LINKS.map(item => (
    <li key={item.label}>
      <Link className={'text-ui-0'} label={item.label} href={item.path} />
    </li>
  ));

  const PrivacyNavLinks = PRIVACY_NAV_LINKS.map(item => (
    <li key={item.label}>
      <Link className="text-ui-0" label={item.label} href={item.path} />
    </li>
  ));

  return (
    <Section data-testid="footer">
      <GridLayout>
        <FullSpan>
          <div className="relative">
            <GradientGreen src={Green} />
            <GradientPurple src={Purple} />
          </div>
          <ActionContainer>
            {isDesktop ? (
              <>
                <FlexDiv>
                  <LogoContainer src={IconLogo} />
                  <StyledNavList>{ExploreNavLinks}</StyledNavList>
                </FlexDiv>
                <FlexDiv>
                  <StyledNavList>{PrivacyNavLinks}</StyledNavList>
                  <Copyright>
                    &copy;{`  ${new Date().getFullYear()}  `}Aragon
                  </Copyright>
                </FlexDiv>
              </>
            ) : (
              <>
                <LogoContainer src={IconLogo} />
                <StyledNavList>{ExploreNavLinks}</StyledNavList>
                <StyledNavList>{PrivacyNavLinks}</StyledNavList>
                <Copyright>
                  &copy;{`  ${new Date().getFullYear()}  `}Aragon
                </Copyright>
              </>
            )}
          </ActionContainer>
        </FullSpan>
      </GridLayout>
    </Section>
  );
};

const FullSpan = styled.div.attrs({
  className: 'col-span-full',
})``;

const Section = styled.section.attrs({
  className: 'w-full bg-primary-400 overflow-hidden',
})``;

const ActionContainer = styled.div.attrs({
  className:
    'relative flex flex-col desktop:flex-row desktop:justify-between items-center space-y-4 desktop:space-y-0 pt-5 desktop:pt-3 pb-8 desktop:pb-3',
})``;

const FlexDiv = styled.div.attrs({
  className: 'flex space-x-4 items-center',
})``;

const LogoContainer = styled.img.attrs({
  className: 'h-5 w-5',
})``;

const StyledNavList = styled.ul.attrs({
  className: 'flex space-x-4',
})``;

const Copyright = styled.span.attrs({
  className: 'text-ui-0 font-normal',
})``;

const GradientGreen = styled.img.attrs({
  className: 'h-50 absolute -top-16 -left-16',
})``;

const GradientPurple = styled.img.attrs({
  className: 'desktop:h-40 h-30 absolute -right-5 desktop:-top-11 top-16',
})``;

export default Footer;
