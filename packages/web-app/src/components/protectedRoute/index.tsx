import {MultisigVotingSettings, VotingSettings} from '@aragon/sdk-client';
import React, {useCallback, useEffect, useRef} from 'react';
import {Outlet} from 'react-router-dom';

import {Loading} from 'components/temporary';
import {GatingMenu} from 'containers/gatingMenu';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useSpecificProvider} from 'context/providers';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoParam} from 'hooks/useDaoParam';
import {PluginTypes} from 'hooks/usePluginClient';
import {usePluginSettings} from 'hooks/usePluginSettings';
import {useWallet} from 'hooks/useWallet';
import {CHAIN_METADATA} from 'utils/constants';
import {formatUnits} from 'utils/library';
import {fetchBalance} from 'utils/tokens';

const ProtectedRoute: React.FC = () => {
  const {open, close, isGatingOpen} = useGlobalModalContext();
  const {data: dao, isLoading: paramIsLoading} = useDaoParam();
  const {address, isConnected, status, isOnWrongNetwork} = useWallet();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetails(dao);
  const {data: daoSettings, isLoading: settingsAreLoading} = usePluginSettings(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes
  );

  const {
    data: {daoToken, filteredMembers},
    isLoading: membersAreLoading,
  } = useDaoMembers(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes,
    address as string
  );

  const {network} = useNetwork();
  const provider = useSpecificProvider(CHAIN_METADATA[network].id);

  const userWentThroughLoginFlow = useRef(false);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const gateTokenBasedProposal = useCallback(async () => {
    if (daoToken && address && filteredMembers.length === 0) {
      const balance = await fetchBalance(
        daoToken?.address,
        address,
        provider,
        CHAIN_METADATA[network].nativeCurrency
      );
      const minProposalThreshold = Number(
        formatUnits(
          (daoSettings as VotingSettings).minProposerVotingPower || 0,
          daoToken?.decimals || 18
        )
      );
      if (minProposalThreshold && Number(balance) < minProposalThreshold) {
        open('gating');
      } else close('gating');
    }
  }, [
    address,
    close,
    daoSettings,
    daoToken,
    filteredMembers.length,
    network,
    open,
    provider,
  ]);

  const gateMultisigProposal = useCallback(() => {
    if ((daoSettings as MultisigVotingSettings).onlyListed === false) {
      close('gating');
    } else if (
      !filteredMembers.some(mem => mem.address === address) &&
      !membersAreLoading
    ) {
      open('gating');
    } else {
      close('gating');
    }
  }, [membersAreLoading, close, daoSettings, open, address, filteredMembers]);

  /*************************************************
   *                     Effects                   *
   *************************************************/
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
        gateTokenBasedProposal();
      } else {
        gateMultisigProposal();
      }

      // user has gone through login flow allow them to log out in peace
      userWentThroughLoginFlow.current = true;
    }
  }, [
    address,
    gateMultisigProposal,
    gateTokenBasedProposal,
    daoDetails?.plugins,
    isOnWrongNetwork,
  ]);

  useEffect(() => {
    // need to do this to close the modal upon user login
    if (address && userWentThroughLoginFlow.current === false) close('wallet');
  }, [address, close]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (
    paramIsLoading ||
    detailsAreLoading ||
    membersAreLoading ||
    settingsAreLoading
  )
    return <Loading />;

  return (
    <>
      {!isGatingOpen && <Outlet />}
      <GatingMenu
        daoAddress={dao}
        pluginType={daoDetails?.plugins[0].id as PluginTypes}
        tokenName={daoToken?.name}
      />
    </>
  );
};

export default ProtectedRoute;
