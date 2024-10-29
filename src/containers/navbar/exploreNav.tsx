import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {ButtonWallet, useScreen} from '@aragon/ods-old';
import {Button, IconType} from '@aragon/ods';
import {useTranslation} from 'react-i18next';

import {useWallet} from 'hooks/useWallet';
import Logo from 'assets/images/logo.svg';
import {useGlobalModalContext} from 'context/globalModals';
import {Container, GridLayout} from 'components/layout';
import {FEEDBACK_FORM} from 'utils/constants';
import classNames from 'classnames';

const ExploreNav: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const {t} = useTranslation();
  const {address, ensName, ensAvatarUrl, isConnected, methods} = useWallet();
  const {open} = useGlobalModalContext();
  const {isDesktop} = useScreen();

  const path = t('logo.linkURL');

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
      const threshold = 250;
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
      <nav className={menuClassNames}>
        <GridLayout>
          <LeftContent>
            <LogoContainer
              src={Logo}
              onClick={() => window.open(path, '_blank')}
            />
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

const LeftContent = styled.div.attrs({
  className: 'col-span-3 md:col-span-2 flex items-center',
})``;

const LogoContainer = styled.img.attrs({
  className: 'h-8 cursor-pointer',
})``;

const RightContent = styled.div.attrs({
  className:
    'col-start-9 col-span-4 flex flex-row-reverse justify-between items-center',
})``;

const ActionsWrapper = styled.div.attrs({
  className: 'flex space-x-3 md:space-x-6 items-center',
})``;

export default ExploreNav;
