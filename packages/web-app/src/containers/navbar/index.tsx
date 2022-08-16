import styled from 'styled-components';
import React, {useMemo} from 'react';
import {matchRoutes, useLocation} from 'react-router-dom';

import {
  CreateDAO,
  Landing,
  Finance,
  Governance,
  NewDeposit,
  NewProposal,
  NewWithDraw,
  ProposeNewSettings,
  EditSettings,
  MintTokensProposal,
  ManageMembersProposal,
  Community,
} from 'utils/paths';
import {i18n} from '../../../i18n.config';
import MobileNav from './mobile';
import useScreen from 'hooks/useScreen';
import DesktopNav from './desktop';
import {useWallet} from 'hooks/useWallet';
import {usePrivacyContext} from 'context/privacyContext';
import {useGlobalModalContext} from 'context/globalModals';

type StringIndexed = {[key: string]: {processLabel: string; returnURL: string}};

const processPaths = [
  {path: NewDeposit},
  {path: NewWithDraw},
  {path: CreateDAO},
  {path: NewProposal},
  {path: ProposeNewSettings},
  {path: MintTokensProposal},
  {path: ManageMembersProposal},
];

const processes: StringIndexed = {
  [CreateDAO]: {processLabel: i18n.t('createDAO.title'), returnURL: Landing},
  [NewDeposit]: {
    processLabel: i18n.t('allTransfer.newTransfer'),
    returnURL: Finance,
  },
  [NewWithDraw]: {
    processLabel: i18n.t('allTransfer.newTransfer'),
    returnURL: Finance,
  },
  [NewProposal]: {
    processLabel: i18n.t('newProposal.title'),
    returnURL: Governance,
  },
  [ProposeNewSettings]: {
    processLabel: i18n.t('settings.proposeSettings'),
    returnURL: EditSettings,
  },
  [MintTokensProposal]: {
    processLabel: i18n.t('labels.addMember'),
    returnURL: Community,
  },
  [ManageMembersProposal]: {
    processLabel: i18n.t('labels.addMember'),
    returnURL: Community,
  },
};

const Navbar: React.FC = () => {
  const {open} = useGlobalModalContext();
  const {pathname} = useLocation();
  const {isDesktop} = useScreen();
  const {methods, isConnected} = useWallet();
  const {handleWithFunctionalPreferenceMenu} = usePrivacyContext();

  const processName = useMemo(() => {
    const results = matchRoutes(processPaths, pathname);
    if (results) return results[0].route.path;
  }, [pathname]);

  /*************************************************
   *                   Handlers                    *
   *************************************************/
  const handleOnDaoSelect = () => {
    handleWithFunctionalPreferenceMenu(() => open('selectDao'));
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

  if (isDesktop) {
    return (
      <DesktopNav
        {...(processName ? {...processes[processName]} : {})}
        onDaoSelect={handleOnDaoSelect}
        onWalletClick={handleWalletButtonClick}
      />
    );
  }
  return (
    <MobileNav
      isProcess={processName !== undefined}
      onDaoSelect={handleOnDaoSelect}
      onWalletClick={handleWalletButtonClick}
    />
  );
};

export default Navbar;

export const NavigationBar = styled.nav.attrs({
  className: `flex tablet:order-1 h-12 justify-between items-center px-2 pb-2 pt-1.5
    tablet:py-2 tablet:px-3 desktop:py-3 desktop:px-5 wide:px-25 text-ui-600`,
})``;
