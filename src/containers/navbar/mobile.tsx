import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {useReactiveVar} from '@apollo/client';
import {AvatarDao, ButtonWallet} from '@aragon/ods-old';
import {Button, IconType} from '@aragon/ods';

import {selectedDaoVar} from 'context/apolloClient';
import {useGlobalModalContext} from 'context/globalModals';
import useScreen from 'hooks/useScreen';
import {useWallet} from 'hooks/useWallet';
import MobileMenu from './mobileMenu';

type MobileNavProps = {
  onDaoSelect: () => void;
  onWalletClick: () => void;
  onFeedbackClick: () => void;
};

const MobileNav: React.FC<MobileNavProps> = props => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {isMobile} = useScreen();
  const currentDao = useReactiveVar(selectedDaoVar);
  const {isConnected, address, ensName, ensAvatarUrl} = useWallet();

  return (
    <>
      <Container data-testid="navbar">
        <Menu>
          <FlexOne>
            {isMobile ? (
              <Button
                variant="tertiary"
                size="lg"
                iconLeft={IconType.MENU}
                onClick={() => open('mobileMenu')}
              />
            ) : (
              <Button
                size="lg"
                variant="tertiary"
                iconLeft={IconType.MENU}
                onClick={() => open('mobileMenu')}
              >
                {t('menu')}
              </Button>
            )}
          </FlexOne>
          <FlexOne className="justify-center">
            <DaoContainer>
              <AvatarDao
                src={currentDao?.metadata?.avatar}
                daoName={currentDao.metadata.name}
                onClick={props.onDaoSelect}
              />
              <DaoName>{currentDao.metadata.name}</DaoName>
            </DaoContainer>
          </FlexOne>
          <FlexOne className="justify-end">
            <ButtonWallet
              src={ensAvatarUrl || address}
              onClick={props.onWalletClick}
              isConnected={isConnected}
              label={
                isConnected ? ensName || address : t('navButtons.connectWallet')
              }
            />
          </FlexOne>
        </Menu>
      </Container>
      <MobileMenu onFeedbackClick={props.onFeedbackClick} />
    </>
  );
};

export default MobileNav;

const FlexOne = styled.div.attrs({
  className: 'flex flex-1' as string | undefined,
})``;

const Container = styled.div.attrs({
  className: 'fixed left-0 bottom-0 w-full z-10',
})``;

const Menu = styled.nav.attrs({
  className: `flex justify-between items-center px-4 md:px-6 py-2
     md:py-3`,
})`
  background: linear-gradient(
    180deg,
    rgba(245, 247, 250, 0) 0%,
    rgba(245, 247, 250, 1) 100%
  );
  backdrop-filter: blur(24px);
`;

const DaoContainer = styled.div.attrs({
  className: 'flex flex-col gap-y-1 items-center rounded-xl',
})``;

const DaoName = styled.p.attrs({
  className:
    'hidden md:block text-sm leading-normal font-semibold text-neutral-800',
})``;
