import {SessionTypes} from '@walletconnect/types';
import React, {useCallback, useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {Loading} from 'components/temporary';
import {useActionsContext} from 'context/actions';
import {useGlobalModalContext} from 'context/globalModals';
import WCdAppValidation, {WC_URI_INPUT_NAME} from './dAppValidationModal';
import SelectWCApp from './selectAppModal';
import {
  WalletConnectContextProvider,
  useWalletConnectInterceptor,
} from './walletConnectProvider';
import ActionListenerModal from './actionListenerModal';

type WalletConnectProps = {
  actionIndex: number;
};

const WalletConnect: React.FC<WalletConnectProps> = ({actionIndex}) => {
  const {removeAction} = useActionsContext();
  const {resetField} = useFormContext();
  const {open} = useGlobalModalContext();

  const wcValues = useWalletConnectInterceptor();

  const [dAppValidationIsOpen, setdAppValidationIsOpen] = useState(false);
  const [listeningActionsIsOpen, setListeningActionsIsOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionTypes.Struct>();

  const showSelectdApp = !dAppValidationIsOpen && !listeningActionsIsOpen;

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/

  /* ******* dAppsList handlers ******* */
  const handleClosedAppsList = useCallback(() => {
    removeAction(actionIndex);
  }, [actionIndex, removeAction]);

  const handleSelectExistingdApp = useCallback(
    (session: SessionTypes.Struct) => {
      setSelectedSession(session);
      setListeningActionsIsOpen(true);
    },
    []
  );

  const handledConnectNewdApp = () => {
    setdAppValidationIsOpen(true);
  };

  const handleSelectWCAppButtonClick = () => {
    handleClosedAppsList();
    open('addAction');
  };

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
      wcValues.sessions.find(({topic}) => topic === selectedSession.topic) !=
      null;

    if (!isSelectedSessionActive) {
      setSelectedSession(undefined);
      setListeningActionsIsOpen(false);
    }
  }, [wcValues.sessions, selectedSession]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (!showSelectdApp && !dAppValidationIsOpen && !listeningActionsIsOpen) {
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
        isOpen={showSelectdApp}
        onClose={handleClosedAppsList}
        onConnectNewdApp={handledConnectNewdApp}
        onBackButtonClicked={handleSelectWCAppButtonClick}
        onSelectExistingdApp={handleSelectExistingdApp}
      />
      <WCdAppValidation
        isOpen={dAppValidationIsOpen}
        onClose={handleClosedAppValidation}
        onConnectionSuccess={handleOnConnectionSuccess}
        onBackButtonClicked={handledAppValidationBackClick}
      />
      {selectedSession && (
        <ActionListenerModal
          isOpen={listeningActionsIsOpen}
          onClose={handleClosedAppValidation}
          actionIndex={actionIndex}
          selectedSession={selectedSession}
          onBackButtonClicked={handledAppValidationBackClick}
        />
      )}
    </WalletConnectContextProvider>
  );
};

export default WalletConnect;
