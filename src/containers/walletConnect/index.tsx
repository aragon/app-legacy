import React, {useCallback, useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {SessionTypes} from '@walletconnect/types';

import {useActionsContext} from 'context/actions';
import WCdAppValidation, {WC_URI_INPUT_NAME} from './dAppValidationModal';
import EmptyState from './emptyStateModal';
import {useWalletConnectInterceptor} from 'hooks/useWalletConnectInterceptor';
import WCConnectedApps from './connectedAppsModal';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import ActionListenerModal from './actionListenerModal';
import {Loading} from 'components/temporary';

type WalletConnectProps = {
  actionIndex: number;
};

const WalletConnect: React.FC<WalletConnectProps> = ({actionIndex}) => {
  const {removeAction} = useActionsContext();

  const {resetField} = useFormContext();
  const [emptyStateIsOpen, setEmptyStateIsOpen] = useState(false);
  const [dAppsListIsOpen, setdAppsListIsOpen] = useState(false);
  const [dAppValidationIsOpen, setdAppValidationIsOpen] = useState(false);
  const [listeningActionsIsOpen, setListeningActionsIsOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionTypes.Struct>();
  const [activeSessions, setActiveSessions] =
    useState<Record<string, SessionTypes.Struct>>();
  const {getActiveSessions} = useWalletConnectInterceptor({});

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  useEffect(() => {
    const sessions = getActiveSessions();
    setActiveSessions(sessions);

    if (sessions) {
      if (Object.keys(sessions).length > 0) {
        setEmptyStateIsOpen(false);
        setdAppsListIsOpen(true);
      } else {
        setEmptyStateIsOpen(true);
      }
    }
  }, [getActiveSessions]);

  /* ******* EmptyState handlers ******* */
  const handleCloseEmptyState = useCallback(() => {
    setEmptyStateIsOpen(false);
    removeAction(actionIndex);
  }, [actionIndex, removeAction]);

  const handleEmptyStateCtaClick = useCallback(() => {
    setEmptyStateIsOpen(false);
    setdAppValidationIsOpen(true);
  }, []);

  /* ******* dAppsList handlers ******* */
  const handleClosedAppsList = useCallback(() => {
    setdAppsListIsOpen(false);
    removeAction(actionIndex);
  }, [actionIndex, removeAction]);

  const handledConnectNewdApp = useCallback(() => {
    setdAppsListIsOpen(false);
    setdAppValidationIsOpen(true);
  }, []);

  const handleSelectExistingdApp = useCallback(
    (session: SessionTypes.Struct) => {
      setdAppsListIsOpen(false);
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

    const sessions = getActiveSessions();
    setActiveSessions(sessions);
    if (sessions && Object.keys(sessions).length > 0) {
      setdAppsListIsOpen(true);
    } else {
      setEmptyStateIsOpen(true);
    }
  }, [getActiveSessions, resetField]);

  const handleOnConnectionSuccess = useCallback(
    (session: SessionTypes.Struct) => {
      resetField(WC_URI_INPUT_NAME);
      setdAppValidationIsOpen(false);
      setListeningActionsIsOpen(true);
      setSelectedSession(session);
    },
    [resetField]
  );

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
    <>
      <EmptyState
        isOpen={emptyStateIsOpen}
        onClose={handleCloseEmptyState}
        onBackButtonClicked={handleCloseEmptyState}
        onCtaClicked={handleEmptyStateCtaClick}
      />
      <WCConnectedApps
        sessions={activeSessions}
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
    </>
  );
};

export default WalletConnect;
