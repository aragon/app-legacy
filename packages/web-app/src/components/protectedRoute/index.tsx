import {MultisigVotingSettings, VotingSettings} from '@aragon/sdk-client';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {Outlet} from 'react-router-dom';

import {Loading} from 'components/temporary';
import {GatingMenu} from 'containers/gatingMenu';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useSpecificProvider} from 'context/providers';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {PluginTypes} from 'hooks/usePluginClient';
import {usePluginSettings} from 'hooks/usePluginSettings';
import {useWallet} from 'hooks/useWallet';
import {CHAIN_METADATA} from 'utils/constants';
import {formatUnits, toDisplayEns} from 'utils/library';
import {fetchBalance} from 'utils/tokens';

const ProtectedRoute: React.FC = () => {
  const {open, close, isGatingOpen} = useGlobalModalContext();
  const {address, status, isOnWrongNetwork} = useWallet();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetailsQuery();

  const [pluginType, pluginAddress] = useMemo(
    () => [
      daoDetails?.plugins[0].id as PluginTypes,
      daoDetails?.plugins[0].instanceAddress as string,
    ],
    [daoDetails?.plugins]
  );

  const {data: daoSettings, isLoading: settingsAreLoading} = usePluginSettings(
    pluginAddress,
    pluginType
  );

  const {
    data: {daoToken, filteredMembers},
    isLoading: membersAreLoading,
  } = useDaoMembers(pluginAddress, pluginType, address as string);

  const {network} = useNetwork();
  const provider = useSpecificProvider(CHAIN_METADATA[network].id);

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
      !filteredMembers.some(
        mem => mem.address.toLowerCase() === address?.toLowerCase()
      ) &&
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
  // The following hook and effects manage a seamless journey from login ->
  // switch network -> authentication. The appropriate modals are shown in
  // such a way to minimize user interaction
  const userWentThroughLoginFlow = useRef(false);
  useEffect(() => {
    // show the wallet menu only if the user hasn't gone through the flow previously
    // and is currently logged out; this allows user to log out mid flow with
    // no lasting consequences considering status will be checked upon proposal creation
    // If we want to keep user logged in (I'm in favor of), remove ref throughout component
    // Fabrice F. - [12/07/2022]
    if (!address && userWentThroughLoginFlow.current === false) open('wallet');
    else {
      if (isOnWrongNetwork) open('network');
      else close('network');
    }
  }, [address, close, isOnWrongNetwork, open, status]);

  // close the wallet modal when the wallet is connected
  useEffect(() => {
    if (
      (status === 'connecting' || address) &&
      userWentThroughLoginFlow.current === false
    ) {
      close('wallet');
    }
  }, [address, close, isOnWrongNetwork, status]);

  // wallet connected and on right network, authenticate
  useEffect(() => {
    if (address && !isOnWrongNetwork && pluginType) {
      if (pluginType === 'token-voting.plugin.dao.eth') {
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
    isOnWrongNetwork,
    pluginType,
  ]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (detailsAreLoading || membersAreLoading || settingsAreLoading)
    return <Loading />;

  return (
    <>
      {!isGatingOpen && userWentThroughLoginFlow.current && <Outlet />}
      {daoDetails && (
        <GatingMenu
          daoAddressOrEns={
            toDisplayEns(daoDetails.ensDomain) || daoDetails.address
          }
          pluginType={pluginType}
          tokenName={daoToken?.name}
        />
      )}
    </>
  );
};

export default ProtectedRoute;
