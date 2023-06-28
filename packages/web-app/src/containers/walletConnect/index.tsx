import React, {useCallback, useState} from 'react';
import {useFormContext} from 'react-hook-form';

import {useActionsContext} from 'context/actions';
import WCdAppValidation, {WC_CODE_INPUT_NAME} from './dAppValidationModal';
import EmptyState from './emptyStateModal';

type WalletConnectProps = {
  actionIndex: number;
};

const WalletConnect: React.FC<WalletConnectProps> = ({actionIndex}) => {
  const {removeAction} = useActionsContext();

  const {resetField} = useFormContext();
  const [emptyStateIsOpen, setEmptyStateIsOpen] = useState(true);
  const [dAppValidationIsOpen, setdAppValidationIsOpen] = useState(false);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  /* ******* EmptyState handlers ******* */
  const handleCloseEmptyState = useCallback(() => {
    setEmptyStateIsOpen(false);
    removeAction(actionIndex);
  }, [actionIndex, removeAction]);

  const handleEmptyStateCtaClick = useCallback(() => {
    setEmptyStateIsOpen(false);
    setdAppValidationIsOpen(true);
  }, []);

  /* ******* dApp Validation handlers ******* */
  const handleClosedAppValidation = useCallback(() => {
    removeAction(actionIndex);
    resetField(WC_CODE_INPUT_NAME);
    setdAppValidationIsOpen(false);
  }, [actionIndex, removeAction, resetField]);

  const handledAppValidationBackClick = useCallback(() => {
    setdAppValidationIsOpen(false);

    // TODO: Assuming the empty state and non-empty state is in the same modal,
    // show that list here instead of merely the empty state
    setEmptyStateIsOpen(true);
  }, []);

  /*************************************************
   *                     Render                    *
   *************************************************/
  return (
    <>
      <EmptyState
        isOpen={emptyStateIsOpen}
        onClose={handleCloseEmptyState}
        onBackButtonClicked={handleCloseEmptyState}
        onCtaClicked={handleEmptyStateCtaClick}
      />
      <WCdAppValidation
        isOpen={dAppValidationIsOpen}
        onBackButtonClicked={handledAppValidationBackClick}
        onClose={handleClosedAppValidation}
      />
    </>
  );
};

export default WalletConnect;
