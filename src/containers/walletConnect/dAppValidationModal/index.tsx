import {AlertInline, Button, IconType} from '@aragon/ods';
import {WalletInputLegacy} from '@aragon/ods-old';
import {SessionTypes} from '@walletconnect/types';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Controller,
  useFormContext,
  useFormState,
  useWatch,
} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import ModalHeader from 'components/modalHeader';
import {useAlertContext} from 'context/alert';
import useScreen from 'hooks/useScreen';
import {TransactionState as ConnectionState} from 'utils/constants/misc';
import {handleClipboardActions} from 'utils/library';
import {useWalletConnectContext} from '../walletConnectProvider';
import {METADATA_NAME_ERROR} from '../walletConnectProvider/useWalletConnectInterceptor';
import WalletConnect from '../../../assets/images/WalletConnectIcon.svg';

type Props = {
  onBackButtonClicked: () => void;
  onConnectionSuccess: (session: SessionTypes.Struct) => void;
  onClose: () => void;
  isOpen: boolean;
};

// Wallet connect id input name
export const WC_URI_INPUT_NAME = 'wcID';

const DAppValidationModal: React.FC<Props> = props => {
  const {onBackButtonClicked, onConnectionSuccess, onClose, isOpen} = props;

  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const {isDesktop} = useScreen();

  const [sessionTopic, setSessionTopic] = useState<string>();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionState>(
    ConnectionState.WAITING
  );
  const {wcConnect, validateURI, sessions} = useWalletConnectContext();

  const {control} = useFormContext();
  const {errors} = useFormState({control});
  const [uri] = useWatch({name: [WC_URI_INPUT_NAME], control});
  const [didConnect, setDidConnect] = useState(false);

  const ctaLabel = useMemo(() => {
    switch (connectionStatus) {
      case ConnectionState.LOADING:
        return t('modal.dappConnect.validation.ctaLabelVerifying');
      case ConnectionState.ERROR:
        return t('modal.dappConnect.validation.ctaLabelCritical');
      case ConnectionState.INCORRECT_URI:
        return t('modal.dappConnect.validation.ctaLabelCritical');
      case ConnectionState.SUCCESS:
        return t('modal.dappConnect.validation.ctaLabelSuccess');
      case ConnectionState.WAITING:
      default:
        return t('modal.dappConnect.validation.ctaLabelDefault');
    }
  }, [t, connectionStatus]);

  const adornmentText = useMemo(() => {
    if (
      connectionStatus === ConnectionState.SUCCESS ||
      connectionStatus === ConnectionState.LOADING
    )
      return t('labels.copy');

    if (uri) return t('labels.clear');

    return t('labels.paste');
  }, [connectionStatus, t, uri]);

  const currentSession = useMemo(
    () => sessions.find(({pairingTopic}) => pairingTopic === sessionTopic),
    [sessions, sessionTopic]
  );

  // Helps await `Adding actions` view correctly, while also resetting the flow if the session is terminated prematurely
  useEffect(() => {
    setDidConnect(currentSession != null);
  }, [currentSession]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  // clear field when there is a value, else paste
  const handleAdornmentClick = useCallback(
    (value: string, onChange: (value: string) => void) => {
      // when there is a value clear it save for when attempting
      // to connect and successfully connected
      if (
        value &&
        connectionStatus !== ConnectionState.SUCCESS &&
        connectionStatus !== ConnectionState.LOADING
      ) {
        onChange('');
        alert(t('alert.chip.inputCleared'));
      } else handleClipboardActions(value, onChange, alert);
    },
    [alert, connectionStatus, t]
  );

  const resetConnectionState = useCallback(() => {
    setConnectionStatus(ConnectionState.WAITING);
    setSessionTopic(undefined);
  }, []);

  const handleBackClick = useCallback(() => {
    onBackButtonClicked();
    resetConnectionState();
  }, [onBackButtonClicked, resetConnectionState]);

  const handleConnectionSuccess = useCallback(() => {
    onConnectionSuccess(currentSession as SessionTypes.Struct);
    resetConnectionState();
  }, [onConnectionSuccess, currentSession, resetConnectionState]);

  const handleConnectDApp = useCallback(async () => {
    setConnectionStatus(ConnectionState.LOADING);

    try {
      const session = await wcConnect({uri});
      setSessionTopic(session.pairingTopic);
      setConnectionStatus(ConnectionState.SUCCESS);
    } catch (error: unknown) {
      if (error === METADATA_NAME_ERROR) {
        setConnectionStatus(ConnectionState.INCORRECT_URI);
      } else {
        setConnectionStatus(ConnectionState.ERROR);
      }
    }
  }, [uri, wcConnect]);

  // Reset the connection state if the session has been terminated on the dApp before `Adding actions` view is closed
  useEffect(() => {
    if (
      connectionStatus === ConnectionState.SUCCESS &&
      didConnect === true &&
      !sessions.includes(currentSession as SessionTypes.Struct)
    ) {
      resetConnectionState();
    }
  }, [
    connectionStatus,
    sessions,
    resetConnectionState,
    didConnect,
    currentSession,
  ]);

  const disableCta = uri == null || Boolean(errors[WC_URI_INPUT_NAME]);

  const ctaHandler =
    connectionStatus === ConnectionState.SUCCESS
      ? handleConnectionSuccess
      : handleConnectDApp;

  /*************************************************
   *                     Render                    *
   *************************************************/

  return (
    <ModalBottomSheetSwitcher isOpen={isOpen} onClose={onClose}>
      <ModalHeader
        title={t('modal.dappConnect.validation.modalTitle')}
        showBackButton
        onBackButtonClicked={handleBackClick}
        {...(isDesktop ? {showCloseButton: true, onClose} : {})}
      />
      <Content>
        <FormGroup>
          <div className="flex flex-col gap-y-3">
            <img
              src={WalletConnect}
              alt="Wallet Connect"
              className="h-[50px]"
            />
            <Description className="text-center">
              {t('modal.dappConnect.desc1')}
            </Description>
            <p className="font-semibold text-neutral-800 ft-text-base">
              {t('modal.dappConnect.validation.codeInputLabel')}
            </p>
            <p className="text-neutral-500 ft-text-sm">
              {t('modal.dappConnect.validation.codeInputHelp')}
            </p>
          </div>
          <Controller
            name={WC_URI_INPUT_NAME}
            control={control}
            rules={{validate: validateURI}}
            defaultValue=""
            render={({
              field: {name, onBlur, onChange, value},
              fieldState: {error},
            }) => (
              <>
                <WalletInputLegacy
                  mode={error ? 'critical' : 'default'}
                  name={name}
                  disabled={
                    connectionStatus === ConnectionState.LOADING ||
                    connectionStatus === ConnectionState.SUCCESS
                  }
                  onBlur={onBlur}
                  onChange={onChange}
                  value={value ?? ''}
                  placeholder={t(
                    'modal.dappConnect.validation.codeInputPlaceholder'
                  )}
                  adornmentText={adornmentText}
                  onAdornmentClick={() => handleAdornmentClick(value, onChange)}
                />
                <div className="mt-2">
                  {error?.message && (
                    <AlertInline variant="critical" message={error.message} />
                  )}
                </div>
              </>
            )}
          />
        </FormGroup>
        <Button
          size="lg"
          variant="primary"
          className="w-full"
          disabled={disableCta}
          isLoading={connectionStatus === ConnectionState.LOADING}
          {...((connectionStatus === ConnectionState.ERROR ||
            connectionStatus === ConnectionState.INCORRECT_URI) && {
            iconLeft: IconType.RELOAD,
          })}
          onClick={ctaHandler}
        >
          {ctaLabel}
        </Button>
        {connectionStatus === ConnectionState.SUCCESS && (
          <AlertWrapper>
            <AlertInline
              message={t('modal.dappConnect.validation.alertSuccess', {
                dappName: currentSession?.peer.metadata.name ?? '',
              })}
              variant="success"
            />
          </AlertWrapper>
        )}
        {connectionStatus === ConnectionState.INCORRECT_URI && (
          <AlertWrapper>
            <AlertInline
              message={t('modal.dappConnect.validation.alertCriticalQRcode')}
              variant="critical"
            />
          </AlertWrapper>
        )}
        {connectionStatus === ConnectionState.ERROR && (
          <AlertWrapper>
            <AlertInline
              message={t('modal.dappConnect.validation.alertCriticalGeneral')}
              variant="critical"
            />
          </AlertWrapper>
        )}
      </Content>
    </ModalBottomSheetSwitcher>
  );
};

export default DAppValidationModal;

const Content = styled.div.attrs({
  className: 'py-6 px-4 xl:px-6 space-y-6',
})``;

const FormGroup = styled.div.attrs({className: 'space-y-3'})``;

const AlertWrapper = styled.div.attrs({
  className: 'mt-3 flex justify-center',
})``;

const Description = styled.p.attrs({
  className: 'ft-text-sm text-neutral-600',
})``;
