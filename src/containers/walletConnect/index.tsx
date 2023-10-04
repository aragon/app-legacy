import React, {useCallback, useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {SessionTypes} from '@walletconnect/types';

import {useActionsContext} from 'context/actions';
import WCdAppValidation, {WC_URI_INPUT_NAME} from './dAppValidationModal';
import EmptyState from './emptyStateModal';
import WCConnectedApps from './connectedAppsModal';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import ActionListenerModal from './actionListenerModal';
import {Loading} from 'components/temporary';
import {
  WalletConnectContextProvider,
  useWalletConnectInterceptor,
} from './walletConnectProvider';

type WalletConnectProps = {
  actionIndex: number;
};

const WalletConnect: React.FC<WalletConnectProps> = ({actionIndex}) => {
  const {removeAction} = useActionsContext();
  const {resetField} = useFormContext();

  const wcValues = useWalletConnectInterceptor();
  const hasActiveSessions = wcValues.activeSessions.length > 0;

  const [dAppValidationIsOpen, setdAppValidationIsOpen] = useState(false);
  const [listeningActionsIsOpen, setListeningActionsIsOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionTypes.Struct>();

  const displayDefaultDialogs =
    !listeningActionsIsOpen && !dAppValidationIsOpen;
  const emptyStateIsOpen = displayDefaultDialogs && !hasActiveSessions;
  const dAppsListIsOpen = displayDefaultDialogs && hasActiveSessions;

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/

  /* ******* EmptyState handlers ******* */
  const handleCloseEmptyState = useCallback(() => {
    removeAction(actionIndex);
  }, [actionIndex, removeAction]);

  const handleEmptyStateCtaClick = useCallback(() => {
    setdAppValidationIsOpen(true);
  }, []);

  /* ******* dAppsList handlers ******* */
  const handleClosedAppsList = useCallback(() => {
    removeAction(actionIndex);
  }, [actionIndex, removeAction]);

  const handledConnectNewdApp = useCallback(() => {
    setdAppValidationIsOpen(true);
  }, []);

  const handleSelectExistingdApp = useCallback(
    (session: SessionTypes.Struct) => {
      setListeningActionsIsOpen(true);
      setSelectedSession(session);
    },
    []
  );

  /* ******* dApp Validation handlers ******* */
  const handleClosedAppValidation = useCallback(() => {
    removeAction(actionIndex);
    resetField(WC_URI_INPUT_NAME);
    setdAppValidationIsOpen(false);
  }, [actionIndex, removeAction, resetField]);

  const handledAppValidationBackClick = useCallback(() => {
    resetField(WC_URI_INPUT_NAME);
    setdAppValidationIsOpen(false);
    setListeningActionsIsOpen(false);
  }, [resetField]);

  const handleOnConnectionSuccess = useCallback(
    (session: SessionTypes.Struct) => {
      resetField(WC_URI_INPUT_NAME);
      setdAppValidationIsOpen(false);
      setListeningActionsIsOpen(true);
      setSelectedSession(session);
    },
    [resetField]
  );

  // Close listeningActions modal when session is terminated on the dApp
  useEffect(() => {
    if (!selectedSession) {
      return;
    }

    const isSelectedSessionActive =
      wcValues.activeSessions.find(
        ({topic}) => topic === selectedSession.topic
      ) != null;

    if (!isSelectedSessionActive) {
      setSelectedSession(undefined);
      setListeningActionsIsOpen(false);
    }
  }, [wcValues.activeSessions, selectedSession]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (
    !emptyStateIsOpen &&
    !dAppsListIsOpen &&
    !dAppValidationIsOpen &&
    !listeningActionsIsOpen
  ) {
    return (
      <ModalBottomSheetSwitcher isOpen={true}>
        <div className="pb-36">
          <Loading />
        </div>
      </ModalBottomSheetSwitcher>
    );
  }

  return (
    <WalletConnectContextProvider value={wcValues}>
      <EmptyState
        isOpen={emptyStateIsOpen}
        onClose={handleCloseEmptyState}
        onBackButtonClicked={handleCloseEmptyState}
        onCtaClicked={handleEmptyStateCtaClick}
      />
      <WCConnectedApps
        isOpen={dAppsListIsOpen}
        onConnectNewdApp={handledConnectNewdApp}
        onSelectExistingdApp={handleSelectExistingdApp}
        onClose={handleClosedAppsList}
      />
      <WCdAppValidation
        isOpen={dAppValidationIsOpen}
        onConnectionSuccess={handleOnConnectionSuccess}
        onBackButtonClicked={handledAppValidationBackClick}
        onClose={handleClosedAppValidation}
      />
      {selectedSession && (
        <ActionListenerModal
          onBackButtonClicked={handledAppValidationBackClick}
          onClose={handleClosedAppValidation}
          isOpen={listeningActionsIsOpen}
          selectedSession={selectedSession}
          actionIndex={actionIndex}
        />
      )}
    </WalletConnectContextProvider>
  );
};

export default WalletConnect;
