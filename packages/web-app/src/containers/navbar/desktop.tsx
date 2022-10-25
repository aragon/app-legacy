import {Breadcrumb, ButtonWallet, CardDao} from '@aragon/ui-components';
import styled from 'styled-components';
import NavLinks from 'components/navLinks';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import React, {useMemo} from 'react';

import {useWallet} from 'hooks/useWallet';
import {selectedDaoVar} from 'context/apolloClient';
import NetworkIndicator from './networkIndicator';
import {useReactiveVar} from '@apollo/client';
import {NavlinksDropdown} from './breadcrumbDropdown';
import {useNetwork} from 'context/network';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';
import {Container} from 'components/layout';

const MIN_ROUTE_DEPTH_FOR_BREADCRUMBS = 2;

type DesktopNavProp = {
  returnURL?: string;
  processLabel?: string;
  onDaoSelect: () => void;
  onWalletClick: () => void;
};

const DesktopNav: React.FC<DesktopNavProp> = props => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {dao} = useParams();
  const currentDao = useReactiveVar(selectedDaoVar);
  const {breadcrumbs, icon, tag} = useMappedBreadcrumbs();
  const {address, ensName, ensAvatarUrl, isConnected} = useWallet();

  const isProcess = useMemo(
    () => props.returnURL && props.processLabel,
    [props.processLabel, props.returnURL]
  );

  const clickHandler = (path: string) => {
    navigate(generatePath(path, {network, dao}));
  };

  if (isProcess) {
    return (
      <Container data-testid="navbar">
        <NetworkIndicator />
        <Menu>
          <Breadcrumb
            crumbs={{label: props.processLabel!, path: props.returnURL!}}
            onClick={clickHandler}
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
    );
  }

  return (
    <Container data-testid="navbar">
      <NetworkIndicator />
      <Menu>
        <Content>
          <CardDao
            daoName={currentDao?.daoName}
            daoAddress={currentDao?.daoEns}
            src={currentDao?.daoLogo}
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
                  onClick={clickHandler}
                  tag={tag}
                />
              </>
            )}
          </LinksWrapper>
        </Content>

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
