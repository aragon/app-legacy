import React, {useEffect, useMemo} from 'react';
import {matchRoutes, useLocation} from 'react-router-dom';
import styled from 'styled-components';

import {ProcessType} from 'containers/exitProcessMenu';
import {selectedDaoVar} from 'context/apolloClient';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {usePrivacyContext} from 'context/privacyContext';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import useScreen from 'hooks/useScreen';
import {useWallet} from 'hooks/useWallet';
import {CHAIN_METADATA, FEEDBACK_FORM} from 'utils/constants';
import {
  Community,
  CreateDAO,
  EditSettings,
  Finance,
  Governance,
  Landing,
  ManageMembersProposal,
  MintTokensProposal,
  NewDeposit,
  NewProposal,
  NewWithDraw,
  ProposeNewSettings,
} from 'utils/paths';
import {i18n} from '../../../i18n.config';
import DesktopNav from './desktop';
import MobileNav from './mobile';

const Navbar: React.FC = () => {
  const {open} = useGlobalModalContext();
  const {pathname} = useLocation();
  const {isDesktop} = useScreen();
  const {network} = useNetwork();
  const {methods, isConnected} = useWallet();
  const {handleWithFunctionalPreferenceMenu} = usePrivacyContext();

  const {data: daoDetails} = useDaoDetailsQuery();

  const processInfo = useMemo(() => {
    const matches = matchRoutes(processPaths, pathname);
    if (matches) return getProcessInfo(matches[0].route.path) as ProcessInfo;
  }, [pathname]);

  // set current dao as selected dao
  useEffect(() => {
    if (daoDetails) {
      selectedDaoVar({
        address: daoDetails.address,
        ensDomain: daoDetails.ensDomain,
        metadata: {
          name: daoDetails.metadata.name,
          avatar: daoDetails.metadata.avatar,
        },
        chain: CHAIN_METADATA[network].id,
        plugins: daoDetails.plugins,
      });
    }
  }, [daoDetails, network]);

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

  const handleFeedbackButtonClick = () => {
    window.open(FEEDBACK_FORM, '_blank');
  };

  if (isDesktop) {
    return (
      <DesktopNav
        isProcess={processInfo?.isProcess}
        returnURL={processInfo?.returnURL}
        processLabel={processInfo?.processLabel}
        processType={processInfo?.processType}
        onDaoSelect={handleOnDaoSelect}
        onWalletClick={handleWalletButtonClick}
        onFeedbackClick={handleFeedbackButtonClick}
      />
    );
  }
  return (
    <MobileNav
      isProcess={processInfo?.isProcess}
      onDaoSelect={handleOnDaoSelect}
      onWalletClick={handleWalletButtonClick}
      onFeedbackClick={handleFeedbackButtonClick}
    />
  );
};

export default Navbar;

export const NavigationBar = styled.nav.attrs({
  className: `flex tablet:order-1 h-12 justify-between items-center px-2 pb-2 pt-1.5
    tablet:py-2 tablet:px-3 desktop:py-3 desktop:px-5 wide:px-25 text-ui-600`,
})``;

/* PROCESS ================================================================= */
type StringIndexed = {[key: string]: {processLabel: string; returnURL: string}};

export const processPaths = [
  {path: NewDeposit},
  {path: NewWithDraw},
  {path: CreateDAO},
  {path: NewProposal},
  {path: ProposeNewSettings},
  {path: MintTokensProposal},
  {path: ManageMembersProposal},
];

export const processes: StringIndexed = {
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
    processLabel: i18n.t('labels.manageMember'),
    returnURL: Community,
  },
};

type ProcessInfo = {
  isProcess: boolean;
  processLabel: string | undefined;
  returnURL: string | undefined;
  processType: 'DaoCreation' | 'ProposalCreation' | undefined;
  processName: string | undefined;
};

function getProcessInfo(
  processPath: string | undefined
): ProcessInfo | undefined {
  if (processPath) {
    return {
      isProcess: true,
      ...processes[processPath],
      processName: processPath,
      processType: getExitProcessType(processPath),
    };
  }
}

function getExitProcessType(processPath: string): ProcessType | undefined {
  switch (processPath) {
    case CreateDAO:
      return 'DaoCreation';

    case ManageMembersProposal:
    case MintTokensProposal:
    case NewProposal:
    case NewWithDraw:
    case ProposeNewSettings:
      return 'ProposalCreation';
  }
}
