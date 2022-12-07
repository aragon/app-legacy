import React, {useCallback, useEffect} from 'react';
import {Outlet} from 'react-router-dom';

import {Loading} from 'components/temporary';
import {GatingMenu} from 'containers/gatingMenu';
import {useGlobalModalContext} from 'context/globalModals';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoParam} from 'hooks/useDaoParam';
import {PluginTypes} from 'hooks/usePluginClient';
import {useWallet} from 'hooks/useWallet';
import {fetchBalance} from 'utils/tokens';
import {CHAIN_METADATA} from 'utils/constants';
import {useSpecificProvider} from 'context/providers';
import {useNetwork} from 'context/network';

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

  const {network} = useNetwork();
  const provider = useSpecificProvider(CHAIN_METADATA[network].id);

  const checkIfTokenbasedMember = useCallback(async () => {
    if (daoToken && address) {
      const balance = await fetchBalance(
        daoToken?.address,
        address,
        provider,
        CHAIN_METADATA[network].nativeCurrency
      );

      if (Number(balance) === 0) open('gating');
    }
  }, [address, daoToken, network, open, provider]);

  const checkIfAllowlistedMember = useCallback(() => {
    if (filteredMembers.length === 0) open('gating');
  }, [filteredMembers.length, open]);

  useEffect(() => {
    // Note: if user came to protected routes by direct link the status could be disconnected > connecting > connected
    // In this scenario "close" on else case will help to fix unexpected behaviors at the wallet loading moment
    if (!isConnected && status !== 'connecting') open('wallet');
    else {
      close('wallet');
      if (isOnWrongNetwork) open('network');
      else close('network');
    }

    // if (
    //   daoDetails &&
    //   isConnected &&
    //   !isOnWrongNetwork &&
    //   filteredMembers.length === 0
    // ) {
    //   if (daoDetails.plugins[0].id === 'erc20voting.dao.eth')
    //     // only checking for members that got token directly not from dao
    //     checkIfTokenbasedMember();
    //   else open('gating');
    // }
    // if (
    //   filteredMembers.length === 0 &&
    //   daoDetails &&
    //   isConnected &&
    //   !isOnWrongNetwork
    // ) {
    //   open('gating');
    // }
  }, [close, isConnected, isOnWrongNetwork, open, status]);

  if (paramIsLoading || detailsAreLoading || MembershipIsLoading)
    return <Loading />;

  return (
    <>
      <Outlet />
      {/* <GatingMenu
        daoAddress={dao}
        pluginType={daoDetails?.plugins[0].id as PluginTypes}
        tokenName={daoToken?.name}
      /> */}
    </>
  );
};

export default ProtectedRoute;
