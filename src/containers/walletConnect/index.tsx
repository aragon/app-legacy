import React, {useCallback, useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {SessionTypes} from '@walletconnect/types';

import {useActionsContext} from 'context/actions';
import WCdAppValidation, {WC_URI_INPUT_NAME} from './dAppValidationModal';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import ActionListenerModal from './actionListenerModal';
import {Loading} from 'components/temporary';
import {
  WalletConnectContextProvider,
  useWalletConnectInterceptor,
} from './walletConnectProvider';
import SelectWCApp, {AllowListDApp} from './selectAppModal';

type WalletConnectProps = {
  actionIndex: number;
};

const WalletConnect: React.FC<WalletConnectProps> = ({actionIndex}) => {
  const {removeAction} = useActionsContext();
  const {resetField} = useFormContext();

  const wcValues = useWalletConnectInterceptor();

  const [dAppValidationIsOpen, setdAppValidationIsOpen] = useState(false);
  const [listeningActionsIsOpen, setListeningActionsIsOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionTypes.Struct>();
  const [selecteddApp, setSelecteddApp] = useState<AllowListDApp>();

  const displayDefaultDialogs =
    !listeningActionsIsOpen && !dAppValidationIsOpen;

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/

  /* ******* dAppsList handlers ******* */
  const handleClosedAppsList = useCallback(() => {
    removeAction(actionIndex);
  }, [actionIndex, removeAction]);

  const handledConnectNewdApp = useCallback((dApp: AllowListDApp) => {
    setSelecteddApp(dApp);
    setdAppValidationIsOpen(true);
  }, []);

  const handleSelectExistingdApp = useCallback(
    (session: SessionTypes.Struct, dApp: AllowListDApp) => {
      setSelectedSession(session);
      setSelecteddApp(dApp);
      setListeningActionsIsOpen(true);
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
      setSelectedSession(session);
      setdAppValidationIsOpen(false);
      setListeningActionsIsOpen(true);
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
    !displayDefaultDialogs &&
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
      <SelectWCApp
        isOpen={displayDefaultDialogs}
        onConnectNewdApp={handledConnectNewdApp}
        onSelectExistingdApp={handleSelectExistingdApp}
        onClose={handleClosedAppsList}
      />
      <WCdAppValidation
        isOpen={dAppValidationIsOpen}
        onConnectionSuccess={handleOnConnectionSuccess}
        onBackButtonClicked={handledAppValidationBackClick}
        onClose={handleClosedAppValidation}
        selecteddApp={selecteddApp}
      />
      {selectedSession && (
        <ActionListenerModal
          onBackButtonClicked={handledAppValidationBackClick}
          onClose={handleClosedAppValidation}
          isOpen={listeningActionsIsOpen}
          selecteddApp={selecteddApp}
          selectedSession={selectedSession}
          actionIndex={actionIndex}
        />
      )}
    </WalletConnectContextProvider>
  );
};

export default WalletConnect;
