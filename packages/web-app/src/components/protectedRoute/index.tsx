import React, {useCallback, useEffect, useRef} from 'react';
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

  const userWentThroughLoginFlow = useRef(false);

  const checkIfTokenBasedMember = useCallback(async () => {
    if (daoToken && address && filteredMembers.length === 0) {
      const balance = await fetchBalance(
        daoToken?.address,
        address,
        provider,
        CHAIN_METADATA[network].nativeCurrency
      );

      if (Number(balance) === 0) open('gating');
      else close('gating');
    }
  }, [
    address,
    close,
    daoToken,
    filteredMembers.length,
    network,
    open,
    provider,
  ]);

  const checkIfAllowlistedMember = useCallback(() => {
    if (filteredMembers.length === 0 && !MembershipIsLoading) open('gating');
    else close('gating');
  }, [MembershipIsLoading, close, filteredMembers, open]);

  useEffect(() => {
    // show the wallet menu only if the user hasn't gone through the flow previously
    // and is currently logged out; this allows user to log out mid flow with
    // no lasting consequences considering status will be checked upon proposal creation
    // If we want to keep user logged in (I'm in favor of), remove ref throughout component
    // Fabrice F. - [12/07/2022]
    if (
      !isConnected &&
      status !== 'connecting' &&
      userWentThroughLoginFlow.current === false
    )
      open('wallet');
    else {
      if (isOnWrongNetwork) open('network');
      else close('network');
    }
  }, [close, isConnected, isOnWrongNetwork, open, status]);

  useEffect(() => {
    if (address && !isOnWrongNetwork && daoDetails?.plugins[0].id) {
      if (daoDetails?.plugins[0].id === 'token-voting.plugin.dao.eth') {
        checkIfTokenBasedMember();
      } else {
        checkIfAllowlistedMember();
      }

      // user has gone through login flow allow them to log out in peace
      userWentThroughLoginFlow.current = true;
    }
  }, [
    address,
    checkIfAllowlistedMember,
    checkIfTokenBasedMember,
    daoDetails?.plugins,
    isOnWrongNetwork,
  ]);

  useEffect(() => {
    // need to do this to close the modal upon user login
    if (address && userWentThroughLoginFlow.current === false) close('wallet');
  }, [address, close]);

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
