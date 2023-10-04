import {
  AlertInline,
  ButtonText,
  IconReload,
  Label,
  Spinner,
  WalletInputLegacy,
} from '@aragon/ods';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Controller,
  useFormContext,
  useFormState,
  useWatch,
} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {SessionTypes} from '@walletconnect/types';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import ModalHeader from 'components/modalHeader';
import useScreen from 'hooks/useScreen';
import {handleClipboardActions} from 'utils/library';
import {useAlertContext} from 'context/alert';
import {TransactionState as ConnectionState} from 'utils/constants/misc';
import {useWalletConnectContext} from '../walletConnectProvider';

type Props = {
  onBackButtonClicked: () => void;
  onConnectionSuccess: (session: SessionTypes.Struct) => void;
  onClose: () => void;
  isOpen: boolean;
};

// Wallet connect id input name
export const WC_URI_INPUT_NAME = 'wcID';

const WCdAppValidation: React.FC<Props> = props => {
  const {onBackButtonClicked, onConnectionSuccess, onClose, isOpen} = props;

  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const {isDesktop} = useScreen();

  const [sessionTopic, setSessionTopic] = useState<string>();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionState>(
    ConnectionState.WAITING
  );

  const {wcConnect, sessions} = useWalletConnectContext();

  const {control} = useFormContext();
  const {errors} = useFormState({control});
  const [uri] = useWatch({name: [WC_URI_INPUT_NAME], control});

  const ctaLabel = useMemo(() => {
    switch (connectionStatus) {
      case ConnectionState.LOADING:
        return t('wc.validation.ctaLabelVerifying');
      case ConnectionState.ERROR:
        return t('wc.validation.ctaLabelCritical');
      case ConnectionState.SUCCESS:
        return t('wc.validation.ctaLabelSuccess');
      case ConnectionState.WAITING:
      default:
        return t('wc.validation.ctaLabel');
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

  const currentSession = sessions.find(
    ({pairingTopic}) => pairingTopic === sessionTopic
  );

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
    const wcConnection = await wcConnect({uri});

    if (wcConnection) {
      setSessionTopic(wcConnection.topic);
    } else {
      setConnectionStatus(ConnectionState.ERROR);
    }
  }, [uri, wcConnect]);

  // Update connectionStatus to SUCCESS when the session is active and acknowledged or reset
  // the connection state if the session has been terminated on the dApp
  useEffect(() => {
    const isLoading = connectionStatus === ConnectionState.LOADING;
    const isSuccess = connectionStatus === ConnectionState.SUCCESS;

    if (isLoading && currentSession != null) {
      setConnectionStatus(
        currentSession.acknowledged
          ? ConnectionState.SUCCESS
          : ConnectionState.ERROR
      );
    } else if (isSuccess && currentSession == null) {
      resetConnectionState();
    }
  }, [connectionStatus, currentSession, resetConnectionState]);

  const disableCta =
    uri == null ||
    connectionStatus === ConnectionState.LOADING ||
    Boolean(errors[WC_URI_INPUT_NAME]);

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
        title={t('wc.validation.modalTitle')}
        showBackButton
        onBackButtonClicked={handleBackClick}
        {...(isDesktop ? {showCloseButton: true, onClose} : {})}
      />
      <Content>
        <FormGroup>
          <Label
            label={t('wc.validation.codeInputLabel')}
            helpText={t('wc.validation.codeInputHelp')}
          />
          {/* TODO: Please add validation when format of wc Code is known */}
          <Controller
            name={WC_URI_INPUT_NAME}
            control={control}
            defaultValue=""
            render={({
              field: {name, onBlur, onChange, value},
              fieldState: {error},
            }) => (
              <WalletInputLegacy
                mode={error ? 'critical' : 'default'}
                name={name}
                onBlur={onBlur}
                onChange={onChange}
                value={value ?? ''}
                placeholder={t('wc.validation.codeInputPlaceholder')}
                adornmentText={adornmentText}
                onAdornmentClick={() => handleAdornmentClick(value, onChange)}
              />
            )}
          />
        </FormGroup>
        <ButtonText
          size="large"
          label={ctaLabel}
          disabled={disableCta}
          className="w-full"
          {...(connectionStatus === ConnectionState.LOADING && {
            iconLeft: <Spinner size={'xs'} />,
            isActive: true,
          })}
          {...(connectionStatus === ConnectionState.ERROR && {
            iconLeft: <IconReload />,
          })}
          onClick={ctaHandler}
        />
        {connectionStatus === ConnectionState.SUCCESS && (
          <AlertWrapper>
            <AlertInline
              label={t('wc.validation.codeInput.statusSuccess', {
                dappName: currentSession?.peer.metadata.name,
              })}
              mode="success"
            />
          </AlertWrapper>
        )}
        {connectionStatus === ConnectionState.ERROR && (
          <AlertWrapper>
            <AlertInline
              label={t('wc.validation.addressInput.alertCritical')}
              mode="critical"
            />
          </AlertWrapper>
        )}
      </Content>
    </ModalBottomSheetSwitcher>
  );
};

export default WCdAppValidation;

const Content = styled.div.attrs({
  className: 'py-3 px-2 desktop:px-3 space-y-3',
})``;

const FormGroup = styled.div.attrs({className: 'space-y-1.5'})``;

const AlertWrapper = styled.div.attrs({
  className: 'mt-1.5 flex justify-center',
})``;
