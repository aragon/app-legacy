import {useReactiveVar} from '@apollo/client';
import {
  Breadcrumb,
  ButtonText,
  ButtonWallet,
  IconFeedback,
} from '@aragon/ui-components';
import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';

import {DaoSelector} from 'components/daoSelector';
import {Container} from 'components/layout';
import NavLinks from 'components/navLinks';
import ExitProcessMenu, {ProcessType} from 'containers/exitProcessMenu';
import {selectedDaoVar} from 'context/apolloClient';
import {useNetwork} from 'context/network';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';
import {useWallet} from 'hooks/useWallet';
import {NavlinksDropdown} from './breadcrumbDropdown';
import NetworkIndicator from './networkIndicator';

const MIN_ROUTE_DEPTH_FOR_BREADCRUMBS = 2;

type DesktopNavProp = {
  isProcess?: boolean;
  returnURL?: string;
  processType?: ProcessType;
  processLabel?: string;
  onDaoSelect: () => void;
  onWalletClick: () => void;
  onFeedbackClick: () => void;
};

const DesktopNav: React.FC<DesktopNavProp> = props => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {dao} = useParams();
  const {breadcrumbs, icon, tag} = useMappedBreadcrumbs();
  const {address, ensName, ensAvatarUrl, isConnected} = useWallet();

  const currentDao = useReactiveVar(selectedDaoVar);

  const [showExitProcessMenu, setShowExitProcessMenu] = useState(false);

  // Note: Obviously because of convoluted navigation, this is being handled here
  // when it should have been in the wizard instead. That said, once new navigation
  // is added, this should be deprecated and removed
  const handleExitWithWarning = () => {
    if (props.processType) {
      setShowExitProcessMenu(true);
    } else {
      navigate(generatePath(props.returnURL!, {network, dao}));
    }
  };

  const exitProcess = useCallback(() => {
    setShowExitProcessMenu(false);
    navigate(generatePath(props.returnURL!, {network, dao}));
  }, [dao, navigate, network, props.returnURL]);

  if (props.isProcess) {
    return (
      <>
        <Container data-testid="navbar">
          <NetworkIndicator />
          <Menu>
            <Breadcrumb
              crumbs={{label: props.processLabel!, path: props.returnURL!}}
              onClick={handleExitWithWarning}
            />

            <ButtonWallet
              src={ensAvatarUrl || address}
              onClick={props.onWalletClick}
              isConnected={isConnected}
              label={
                isConnected ? ensName || address : t('navButtons.connectWallet')
              }
            />
          </Menu>
        </Container>
        {props.processType && (
          <ExitProcessMenu
            isOpen={showExitProcessMenu}
            processType={props.processType}
            onClose={() => setShowExitProcessMenu(false)}
            ctaCallback={exitProcess}
          />
        )}
      </>
    );
  }

  return (
    <Container data-testid="navbar">
      <NetworkIndicator />
      <Menu>
        <Content>
          <DaoSelector
            daoAddress={currentDao.ensDomain}
            daoName={currentDao?.metadata?.name || currentDao?.ensDomain}
            src={currentDao.metadata.avatar}
            onClick={props.onDaoSelect}
          />
          <LinksWrapper>
            {breadcrumbs.length < MIN_ROUTE_DEPTH_FOR_BREADCRUMBS ? (
              <NavLinks />
            ) : (
              <>
                <NavlinksDropdown />
                <Breadcrumb
                  icon={icon}
                  crumbs={breadcrumbs}
                  onClick={path => navigate(generatePath(path, {network, dao}))}
                  tag={tag}
                />
              </>
            )}
          </LinksWrapper>
        </Content>

        <div className="flex gap-2">
          <ButtonText
            className="w-full tablet:w-max"
            size="large"
            label={t('navButtons.giveFeedback')}
            mode="secondary"
            iconRight={<IconFeedback />}
            onClick={props.onFeedbackClick}
          />

          <ButtonWallet
            src={ensAvatarUrl || address}
            onClick={props.onWalletClick}
            isConnected={isConnected}
            label={
              isConnected ? ensName || address : t('navButtons.connectWallet')
            }
          />
        </div>
      </Menu>
    </Container>
  );
};

export default DesktopNav;

const Menu = styled.nav.attrs({
  className: `flex mx-auto justify-between items-center max-w-screen-wide
     px-5 wide:px-10 py-3`,
})`
  background: linear-gradient(
    180deg,
    rgba(245, 247, 250, 1) 0%,
    rgba(245, 247, 250, 0) 100%
  );
  backdrop-filter: blur(24px);
`;

const Content = styled.div.attrs({
  className: 'flex items-center space-x-6',
})``;

const LinksWrapper = styled.div.attrs({
  className: 'flex items-center space-x-1.5',
})``;
