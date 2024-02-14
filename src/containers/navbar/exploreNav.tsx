import React from 'react';
import styled from 'styled-components';
import {ButtonWallet, useScreen} from '@aragon/ods-old';
import {Button, IconType} from '@aragon/ods';
import {useTranslation} from 'react-i18next';

import {useWallet} from 'hooks/useWallet';
import Logo from 'public/logo.svg';
import {useGlobalModalContext} from 'context/globalModals';
import {Container, GridLayout} from 'components/layout';
import {FEEDBACK_FORM} from 'utils/constants';

const ExploreNav: React.FC = () => {
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
      // To be implemented: maybe add an error message when
      // the error is different from closing the window
      console.error(err);
    });
  };

  return (
    <Container data-testid="navbar">
      <Menu>
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
                  size="lg"
                  variant="tertiary"
                  iconRight={IconType.FEEDBACK}
                  onClick={handleFeedbackButtonClick}
                >
                  {t('navButtons.giveFeedback')}
                </Button>
              ) : (
                <Button
                  size="lg"
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
      </Menu>
    </Container>
  );
};

const Menu = styled.nav.attrs({
  className: 'py-4 xl:py-6',
})`
  background: linear-gradient(180deg, #3164fa 0%, rgba(49, 100, 250, 0) 100%);
`;

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
