import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {ButtonWallet, useScreen} from '@aragon/ods-old';
import {Button, IconType} from '@aragon/ods';
import {useTranslation} from 'react-i18next';
import {useWallet} from 'hooks/useWallet';
import {useGlobalModalContext} from 'context/globalModals';
import {GridLayout} from 'components/layout';
import {FEEDBACK_FORM} from 'utils/constants';
import classNames from 'classnames';
import {Logotype} from 'components/logos/logotype';
import {Logo} from 'components/logos/logo';
import {DeprecationBanner} from 'components/deprecationBanner/deprecationBanner';

const ExploreNav: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const {t} = useTranslation();
  const {address, ensName, ensAvatarUrl, isConnected, methods} = useWallet();
  const {open} = useGlobalModalContext();
  const {isDesktop, isMobile} = useScreen();

  const handleFeedbackButtonClick = () => {
    window.open(FEEDBACK_FORM, '_blank');
  };

  const handleWalletButtonClick = () => {
    if (isConnected) {
      open('wallet');
      return;
    }

    methods.selectWallet().catch((err: Error) => {
      console.error(err);
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const threshold = 276;
      if (window.scrollY > threshold) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const menuClassNames = classNames('py-4 xl:py-6', {
    'bg-gradient-to-b from-primary-400 to-transparent': !isScrolled,
    'bg-primary-400': isScrolled,
  });

  return (
    <Container data-testid="navbar">
      <DeprecationBanner />
      <nav className={menuClassNames}>
        <GridLayout className="grid grid-cols-[auto,1fr] items-center">
          <LeftContent>
            <LogoContainer href="/">
              {isMobile ? <Logo /> : <Logotype />}
            </LogoContainer>
          </LeftContent>
          <RightContent>
            <ActionsWrapper>
              {isDesktop ? (
                <Button
                  variant="tertiary"
                  iconRight={IconType.FEEDBACK}
                  onClick={handleFeedbackButtonClick}
                >
                  {t('navButtons.giveFeedback')}
                </Button>
              ) : (
                <Button
                  variant="tertiary"
                  iconLeft={IconType.FEEDBACK}
                  onClick={handleFeedbackButtonClick}
                />
              )}
              <ButtonWallet
                src={ensAvatarUrl || address}
                onClick={handleWalletButtonClick}
                isConnected={isConnected}
                label={
                  isConnected
                    ? ensName || address
                    : t('navButtons.connectWallet')
                }
              />
            </ActionsWrapper>
          </RightContent>
        </GridLayout>
      </nav>
    </Container>
  );
};

export const Container = styled.header.attrs({
  className: 'sticky top-0 w-full z-[var(--app-navbar-z-index)]',
})``;

const LeftContent = styled.div.attrs({
  className: 'col-span-2 flex items-center',
})``;

const LogoContainer = styled.a.attrs({
  className: 'h-10 text-neutral-0',
})``;

const RightContent = styled.div.attrs({
  className:
    'col-start-9 col-span-4 flex flex-row-reverse justify-between items-center',
})``;

const ActionsWrapper = styled.div.attrs({
  className: 'flex space-x-3 md:space-x-6 items-center',
})``;

export default ExploreNav;
