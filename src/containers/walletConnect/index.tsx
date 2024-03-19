import {SessionTypes} from '@walletconnect/types';
import React, {useCallback, useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {Loading} from 'components/temporary';
import {useActionsContext} from 'context/actions';
import {useGlobalModalContext} from 'context/globalModals';
import DAppValidationModal, {WC_URI_INPUT_NAME} from './dAppValidationModal';
import SelectdAppModal from './selectdAppModal';
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
  const [actionListenerIsOpen, setActionListenerIsOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionTypes.Struct>();

  const showSelectdApp = !dAppValidationIsOpen && !actionListenerIsOpen;

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/

  /* ******* dAppsList handlers ******* */
  const handleCloseSelectdAppModal = useCallback(() => {
    removeAction(actionIndex);
  }, [actionIndex, removeAction]);

  const handleSelectExistingdApp = useCallback(
    (session: SessionTypes.Struct) => {
      setSelectedSession(session);
      setActionListenerIsOpen(true);
    },
    []
  );

  const handledConnectNewdApp = () => {
    setdAppValidationIsOpen(true);
  };

  const handleSelectWCAppButtonClick = () => {
    removeAction(actionIndex);
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
    setActionListenerIsOpen(false);
  }, [resetField]);

  const handleOnConnectionSuccess = useCallback(
    (session: SessionTypes.Struct) => {
      resetField(WC_URI_INPUT_NAME);
      setSelectedSession(session);
      setdAppValidationIsOpen(false);
      setActionListenerIsOpen(true);
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
      setActionListenerIsOpen(false);
    }
  }, [wcValues.sessions, selectedSession]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (!showSelectdApp && !dAppValidationIsOpen && !actionListenerIsOpen) {
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
      <SelectdAppModal
        isOpen={showSelectdApp}
        onClose={handleCloseSelectdAppModal}
        onConnectNewdApp={handledConnectNewdApp}
        onBackButtonClicked={handleSelectWCAppButtonClick}
        onSelectExistingdApp={handleSelectExistingdApp}
      />
      <DAppValidationModal
        isOpen={dAppValidationIsOpen}
        onClose={handleClosedAppValidation}
        onConnectionSuccess={handleOnConnectionSuccess}
        onBackButtonClicked={handledAppValidationBackClick}
      />
      {selectedSession && (
        <ActionListenerModal
          isOpen={actionListenerIsOpen}
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
