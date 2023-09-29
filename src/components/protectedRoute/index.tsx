import {
  MajorityVotingSettings,
  MultisigVotingSettings,
} from '@aragon/sdk-client';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Outlet, useNavigate} from 'react-router-dom';

import {Loading} from 'components/temporary';
import {LoginRequired} from 'containers/walletMenu/LoginRequired';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {PluginTypes} from 'hooks/usePluginClient';
import {useWallet} from 'hooks/useWallet';
import {useVotingPowerAsync} from 'services/aragon-sdk/queries/use-voting-power';
import {useVotingSettings} from 'services/aragon-sdk/queries/use-voting-settings';
import {CHAIN_METADATA} from 'utils/constants';
import {formatUnits} from 'utils/library';
import {fetchBalance} from 'utils/tokens';

const ProtectedRoute: React.FC = () => {
  const navigate = useNavigate();
  const {open, close, isOpen} = useGlobalModalContext('gating');
  const {
    address,
    status,
    isOnWrongNetwork,
    isModalOpen: web3ModalIsShown,
  } = useWallet();
  const {network} = useNetwork();
  const {api: provider} = useProviders();

  const [showLoginModal, setShowLoginModal] = useState(false);

  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetailsQuery();
  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;

  const {data: votingSettings, isLoading: settingsAreLoading} =
    useVotingSettings({
      pluginAddress,
      pluginType,
    });

  const {
    data: {daoToken, filteredMembers},
    isLoading: membersAreLoading,
  } = useDaoMembers(pluginAddress, pluginType, address as string);
  const fetchVotingPower = useVotingPowerAsync();

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleCloseLoginModal = useCallback(() => {
    setShowLoginModal(false);

    // navigate back to the page the user came from
    navigate(-1);
  }, [navigate]);

  const gateTokenBasedProposal = useCallback(async () => {
    if (daoToken && address && filteredMembers.length === 0) {
      let balance = '0';
      let votingPower = '0';

      try {
        balance = await fetchBalance(
          daoToken?.address,
          address,
          provider,
          CHAIN_METADATA[network].nativeCurrency
        );

        const votingPowerWei = await fetchVotingPower({
          address,
          tokenAddress: daoToken?.address,
        });
        votingPower = formatUnits(votingPowerWei, daoToken.decimals);
      } catch (e) {
        console.error(e);
      }

      const minProposalThreshold = Number(
        formatUnits(
          (votingSettings as MajorityVotingSettings)?.minProposerVotingPower ||
            0,
          daoToken?.decimals || 18
        )
      );
      if (
        minProposalThreshold &&
        Number(balance) < minProposalThreshold &&
        Number(votingPower) < minProposalThreshold
      ) {
        open('gating');
      } else {
        close();
      }
    }
  }, [
    address,
    fetchVotingPower,
    close,
    votingSettings,
    daoToken,
    filteredMembers.length,
    network,
    open,
    provider,
  ]);

  const gateMultisigProposal = useCallback(() => {
    const everyoneAllowed =
      (votingSettings as MultisigVotingSettings)?.onlyListed === false;

    const isMember = filteredMembers.some(
      ({address: memberAddress}) =>
        memberAddress.toLowerCase() === address?.toLowerCase()
    );

    if (!membersAreLoading && !isMember && !everyoneAllowed && !isOpen) {
      open('gating');
    }

    if (isOpen && (isMember || everyoneAllowed)) {
      close();
    }
  }, [
    membersAreLoading,
    close,
    isOpen,
    votingSettings,
    open,
    address,
    filteredMembers,
  ]);

  /*************************************************
   *                     Effects                   *
   *************************************************/
  // The following hook and effects manage a seamless journey from login ->
  // switch network -> authentication. The appropriate modals are shown in
  // such a way to minimize user interaction
  const userWentThroughLoginFlowRef = useRef(false);
  const web3ModalWasShownRef = useRef(false);

  useEffect(() => {
    // show the wallet menu only if the user hasn't gone through the flow previously
    // and is currently logged out; this allows user to log out mid flow with
    // no lasting consequences considering status will be checked upon proposal creation
    // If we want to keep user logged in (I'm in favor of), remove ref throughout component
    // Fabrice F. - [12/07/2022]
    if (!address && userWentThroughLoginFlowRef.current === false) {
      setShowLoginModal(true);
    } else {
      if (isOnWrongNetwork) {
        open('network');
      } else {
        close();
      }
    }
  }, [address, close, isOnWrongNetwork, open]);

  // close the LoginRequired modal when web3Modal is shown
  useEffect(() => {
    if (web3ModalIsShown) setShowLoginModal(false);
  }, [close, web3ModalIsShown]);

  // a weird state happens when the web3Modal has been closed
  // by the user without logging in. The status is set to
  // "connecting" instead of "disconnected". Regardless, this
  // state set to be the same as the user closing the LoginRequired
  // modal manually [FF-07/03/2023]
  useEffect(() => {
    if (
      status === 'connecting' &&
      !showLoginModal &&
      !web3ModalIsShown &&
      web3ModalWasShownRef.current
    )
      navigate(-1);
  }, [navigate, showLoginModal, status, web3ModalIsShown]);

  // update the reference whenever the web3Modal is shown
  useEffect(() => {
    if (web3ModalIsShown) web3ModalWasShownRef.current = true;
  }, [web3ModalIsShown]);

  // wallet connected and on right network, authenticate
  useEffect(() => {
    if (status === 'connected' && !isOnWrongNetwork && pluginType) {
      if (pluginType === 'token-voting.plugin.dao.eth') {
        gateTokenBasedProposal();
      } else {
        gateMultisigProposal();
      }

      // user has gone through login flow allow them to log out in peace
      userWentThroughLoginFlowRef.current = true;
    }
  }, [
    gateMultisigProposal,
    gateTokenBasedProposal,
    isOnWrongNetwork,
    pluginType,
    status,
  ]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (detailsAreLoading || membersAreLoading || settingsAreLoading) {
    return <Loading />;
  }

  return (
    <>
      {!isOpen && userWentThroughLoginFlowRef.current && <Outlet />}
      <LoginRequired isOpen={showLoginModal} onClose={handleCloseLoginModal} />
    </>
  );
};

export default ProtectedRoute;
