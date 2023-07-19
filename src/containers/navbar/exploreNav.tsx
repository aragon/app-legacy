import React from 'react';
import styled from 'styled-components';
import {
  ButtonIcon,
  ButtonText,
  ButtonWallet,
  IconFeedback,
  useScreen,
} from '@aragon/ods';
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
                <ButtonText
                  size="large"
                  label={t('navButtons.giveFeedback')}
                  mode="secondary"
                  iconRight={<IconFeedback />}
                  onClick={handleFeedbackButtonClick}
                />
              ) : (
                <ButtonIcon
                  size="large"
                  mode="secondary"
                  icon={<IconFeedback />}
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
  className: 'py-2 desktop:py-3',
})`
  background: linear-gradient(180deg, #3164fa 0%, rgba(49, 100, 250, 0) 100%);
`;

const LeftContent = styled.div.attrs({
  className: 'col-span-3 tablet:col-span-2 flex items-center',
})``;

const LogoContainer = styled.img.attrs({
  className: 'h-4 cursor-pointer',
})``;

const RightContent = styled.div.attrs({
  className:
    'col-start-9 col-span-4 flex flex-row-reverse justify-between items-center',
})``;

const ActionsWrapper = styled.div.attrs({
  className: 'flex space-x-1.5 tablet:space-x-3 items-center',
})``;

export default ExploreNav;
