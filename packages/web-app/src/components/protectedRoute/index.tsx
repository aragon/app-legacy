import React, {useEffect} from 'react';
import {Outlet} from 'react-router-dom';

import {Loading} from 'components/temporary';
import {GatingMenu} from 'containers/gatingMenu';
import {useGlobalModalContext} from 'context/globalModals';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoParam} from 'hooks/useDaoParam';
import {PluginTypes} from 'hooks/usePluginClient';
import {useWallet} from 'hooks/useWallet';

const ProtectedRoute: React.FC = () => {
  const {data: dao, isLoading: paramIsLoading} = useDaoParam();
  const {address, isConnected, status, isOnWrongNetwork} = useWallet();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetails(
    dao || ''
  );
  const {open, close} = useGlobalModalContext();
  const {
    data: {daoToken, filteredMembers},
    isLoading: MembershipIsLoading,
  } = useDaoMembers(
    daoDetails?.plugins[0].instanceAddress || '',
    daoDetails?.plugins[0].id as PluginTypes,
    address as string
  );

  useEffect(() => {
    // Note: if user came to protected routes by direct link the status could be disconnected > connecting > connected
    // In this scenario "close" on else case will help to fix unexpected behaviors at the wallet loading moment
    if (!isConnected && status !== 'connecting') open('wallet');
    else {
      close('wallet');
      if (isOnWrongNetwork) open('network');
      else close('network');
    }

    if (
      filteredMembers.length === 0 &&
      daoDetails &&
      isConnected &&
      !isOnWrongNetwork
    ) {
      open('gating');
    }
  }, [
    close,
    daoDetails,
    filteredMembers.length,
    isConnected,
    isOnWrongNetwork,
    open,
    status,
  ]);

  if (paramIsLoading || detailsAreLoading || MembershipIsLoading)
    return <Loading />;

  return (
    <>
      <Outlet />
      <GatingMenu
        daoAddress={dao}
        pluginType={daoDetails?.plugins[0].id as PluginTypes}
        tokenName={daoToken?.name}
      />
    </>
  );
};

export default ProtectedRoute;
