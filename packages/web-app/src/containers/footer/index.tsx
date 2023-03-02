import {IconInfo, Link} from '@aragon/ui-components';
import React from 'react';
import styled from 'styled-components';

import {GridLayout} from 'components/layout';
import useScreen from 'hooks/useScreen';
import IconLogoBlue from 'public/iconLogoBlue.svg';
import {EXPLORE_NAV_LINKS, PRIVACY_NAV_LINKS} from 'utils/constants';
import {useWallet} from 'hooks/useWallet';

const Footer: React.FC = () => {
  const {isDesktop} = useScreen();
  const {isOnWrongNetwork} = useWallet();

  const ExploreNavLinks = EXPLORE_NAV_LINKS.map(item => (
    <li key={item.label}>
      <Link href={item.path} label={item.label} type="neutral" />
    </li>
  ));

  const PrivacyNavLinks = PRIVACY_NAV_LINKS.map(item => (
    <li key={item.label}>
      <Link label={item.label} href={item.path} type="neutral" />
    </li>
  ));

  return (
    <Section data-testid="footer">
      <GridLayout>
        <FullSpan>
          <ActionContainer>
            {isDesktop ? (
              <>
                <FlexDiv>
                  <LogoContainer src={IconLogoBlue} />
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
                <LogoContainer src={IconLogoBlue} />
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
      <div
        className={`flex z-10 justify-center items-center py-0.5 desktop:mb-0 space-x-1 text-sm text-ui-0 bg-primary-400 ${
          isOnWrongNetwork ? 'mb-11 tablet:mb-15' : 'mb-8 tablet:mb-12'
        }`}
      >
        <IconInfo />
        <span>Aragon App Public Beta</span>
      </div>
    </Section>
  );
};

const FullSpan = styled.div.attrs({
  className: 'col-span-full',
})`
  overflow-y: clip;
`;

const Section = styled.section.attrs({
  className: 'w-full overflow-hidden bg-ui-0 mt-8',
})``;

const ActionContainer = styled.div.attrs({
  className:
    'relative flex flex-col desktop:flex-row desktop:justify-between items-center space-y-4 desktop:space-y-0 pt-5 desktop:pt-3 pb-8 desktop:pb-3',
})``;

const FlexDiv = styled.div.attrs({
  className: 'flex space-x-4 items-center',
})``;

const LogoContainer = styled.img.attrs({
  className: 'h-5',
})``;

const StyledNavList = styled.ul.attrs({
  className: 'flex space-x-4',
})``;

const Copyright = styled.span.attrs({
  className: 'text-ui-600 font-normal',
})``;

export default Footer;
