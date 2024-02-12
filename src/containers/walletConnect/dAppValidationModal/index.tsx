import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  AlertInline,
  ButtonText,
  Label,
  WalletInputLegacy,
} from '@aragon/ods-old';
import {Icon, IconType, Spinner} from '@aragon/ods';
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
import {
  AllowListDApp,
  AllowListDApps,
  enableConnectAnyDApp,
} from '../selectAppModal';
import {METADATA_NAME_ERROR} from '../walletConnectProvider/useWalletConnectInterceptor';

type Props = {
  onBackButtonClicked: () => void;
  onConnectionSuccess: (session: SessionTypes.Struct) => void;
  onClose: () => void;
  isOpen: boolean;
  selecteddApp?: AllowListDApp;
};

// Wallet connect id input name
export const WC_URI_INPUT_NAME = 'wcID';

const WCdAppValidation: React.FC<Props> = props => {
  const {
    onBackButtonClicked,
    onConnectionSuccess,
    onClose,
    isOpen,
    selecteddApp,
  } = props;

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

    const appInAllowlist = AllowListDApps.filter(
      dApp =>
        dApp.name === selecteddApp?.name &&
        selecteddApp.name !== 'Connect any app'
    );

    try {
      const session = await wcConnect({
        uri,
        metadataName:
          enableConnectAnyDApp && appInAllowlist.length === 0
            ? undefined
            : selecteddApp?.name.toLowerCase(),
      });
      setSessionTopic(session.pairingTopic);
      setConnectionStatus(ConnectionState.SUCCESS);
    } catch (error: unknown) {
      if (error === METADATA_NAME_ERROR) {
        setConnectionStatus(ConnectionState.INCORRECT_URI);
      } else {
        setConnectionStatus(ConnectionState.ERROR);
      }
    }
  }, [uri, wcConnect, selecteddApp?.name]);

  // Reset the connection state if the session has been terminated on the dApp
  useEffect(() => {
    const isSuccess = connectionStatus === ConnectionState.SUCCESS;

    if (isSuccess && currentSession == null) {
      resetConnectionState();
    }
  }, [connectionStatus, currentSession, resetConnectionState, selecteddApp]);

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
  if (!selecteddApp) {
    return null;
  }

  const dappName = selecteddApp.shortName || selecteddApp.name;

  return (
    <ModalBottomSheetSwitcher isOpen={isOpen} onClose={onClose}>
      <ModalHeader
        title={dappName}
        showBackButton
        onBackButtonClicked={handleBackClick}
        {...(isDesktop ? {showCloseButton: true, onClose} : {})}
      />
      <Content>
        <FormGroup>
          <Label
            label={t('modal.dappConnect.validation.codeInputLabel')}
            helpText={t('modal.dappConnect.validation.codeInputHelp', {
              dappName,
            })}
          />
          {/* TODO: Please add validation when format of wc Code is known */}
          <Controller
            name={WC_URI_INPUT_NAME}
            control={control}
            rules={{
              validate: validateURI,
            }}
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
                    <AlertInline label={error.message} mode="critical" />
                  )}
                </div>
              </>
            )}
          />
        </FormGroup>
        <ButtonText
          size="large"
          label={ctaLabel}
          disabled={disableCta}
          className="w-full"
          {...(connectionStatus === ConnectionState.LOADING && {
            iconLeft: <Spinner size="sm" variant="primary" />,
            isActive: true,
          })}
          {...((connectionStatus === ConnectionState.ERROR ||
            connectionStatus === ConnectionState.INCORRECT_URI) && {
            iconLeft: <Icon icon={IconType.RELOAD} />,
          })}
          onClick={ctaHandler}
        />
        {connectionStatus === ConnectionState.SUCCESS && (
          <AlertWrapper>
            <AlertInline
              label={t('modal.dappConnect.validation.alertSuccess', {
                dappName,
              })}
              mode="success"
            />
          </AlertWrapper>
        )}
        {connectionStatus === ConnectionState.INCORRECT_URI && (
          <AlertWrapper>
            <AlertInline
              label={t('modal.dappConnect.validation.alertCriticalQRcode', {
                dappName,
              })}
              mode="critical"
            />
          </AlertWrapper>
        )}
        {connectionStatus === ConnectionState.ERROR && (
          <AlertWrapper>
            <AlertInline
              label={t('modal.dappConnect.validation.alertCriticalGeneral', {
                dappName,
              })}
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
  className: 'py-6 px-4 xl:px-6 space-y-6',
})``;

const FormGroup = styled.div.attrs({className: 'space-y-3'})``;

const AlertWrapper = styled.div.attrs({
  className: 'mt-3 flex justify-center',
})``;
