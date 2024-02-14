import React, {Ref, forwardRef, useCallback, useEffect, useState} from 'react';
import {InputValue, WalletInput, WalletInputProps} from '@aragon/ods-old';
import {AlertInline} from '@aragon/ods';
import {useTranslation} from 'react-i18next';

import {useAlertContext} from 'context/alert';
import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {CHAIN_METADATA, ENS_SUPPORTED_NETWORKS} from 'utils/constants/chains';

// delay (in ms) to remove the resolved/verified labels
const RESOLVED_LABEL_DELAY = 1000;

type WrappedWalletInputProps = {
  onChange: (value: InputValue) => void;
  error?: string;
  resolveLabels?: 'enabled' | 'disabled' | 'onBlur';
} & Omit<WalletInputProps, 'onValueChange'>;

/**
 * This component bootstraps the WalletInput from the ui-components
 * with the proper alerts (inline and chip), ENS domain resolvers etc
 */
export const WrappedWalletInput = forwardRef(
  (
    {
      onChange,
      error,
      resolveLabels = 'disabled',
      ...props
    }: WrappedWalletInputProps,
    ref: Ref<HTMLTextAreaElement> | undefined
  ) => {
    const areaRef = React.useRef<HTMLTextAreaElement>(null);

    const {t} = useTranslation();
    const {alert} = useAlertContext();
    const {network} = useNetwork();
    const {api: provider} = useProviders();

    const [isFocused, setIsFocused] = useState(false);
    const [ensResolved, setEnsResolved] = useState(false);
    const [addressValidated, setAddressValidated] = useState(false);

    const networkSupportsENS = ENS_SUPPORTED_NETWORKS.includes(network);

    const inputValue = props.value.ensName || props.value.address;
    const isEnsAttemptedInput =
      !!inputValue && inputValue.toLowerCase().includes('.eth');

    const showResolvedLabels =
      resolveLabels === 'enabled' || resolveLabels === 'onBlur';

    /*************************************************
     *                    Effects                    *
     *************************************************/
    // track the focus state of the input
    useEffect(() => {
      const handleBlur = () => setIsFocused(false);
      const handleFocus = () => setIsFocused(true);

      const textareaElement = areaRef.current;

      if (textareaElement) {
        textareaElement.addEventListener('focus', handleFocus);
        textareaElement.addEventListener('blur', handleBlur);
      }

      return () => {
        if (textareaElement) {
          textareaElement.removeEventListener('focus', handleFocus);
          textareaElement.removeEventListener('blur', handleBlur);
        }
      };
    }, []);

    // resolve the forwarded ref and local ref
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(areaRef.current);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
          areaRef.current;
      }
    }, [ref]);

    const removeLabels = useCallback(() => {
      setTimeout(() => {
        setEnsResolved(false);
        setAddressValidated(false);
      }, RESOLVED_LABEL_DELAY);
    }, []);

    useEffect(() => {
      if (!isFocused && resolveLabels === 'onBlur') {
        removeLabels();
      }
    }, [isFocused, removeLabels, resolveLabels]);

    /*************************************************
     *             Callbacks and Handlers            *
     *************************************************/
    const resolveEnsNameFromAddress = useCallback(
      (address: string | Promise<string>) => provider.lookupAddress(address),
      [provider]
    );

    const resolveAddressFromEnsName = useCallback(
      (ensName: string | Promise<string>) => provider.resolveName(ensName),
      [provider]
    );

    const handleEnsResolved = useCallback(() => {
      if (showResolvedLabels && isFocused) {
        setAddressValidated(false);
        setEnsResolved(true);
      }
    }, [isFocused, showResolvedLabels]);

    const handleAddressValidated = useCallback(() => {
      if (showResolvedLabels && isFocused) {
        setEnsResolved(false);
        setAddressValidated(true);
      }
    }, [isFocused, showResolvedLabels]);

    /*************************************************
     *                    Render                     *
     *************************************************/
    return (
      <>
        <WalletInput
          blockExplorerURL={CHAIN_METADATA[network].explorer + 'address/'}
          onAddressValidated={handleAddressValidated}
          onEnsResolved={handleEnsResolved}
          onClearButtonClick={() => alert(t('alert.chip.inputCleared'))}
          onCopyButtonClick={() => alert(t('alert.chip.inputCopied'))}
          onPasteButtonClick={() => alert(t('alert.chip.inputPasted'))}
          onValueChange={onChange}
          placeholder={
            networkSupportsENS ? t('inputWallet.placeholder') : '0x…'
          }
          {...(networkSupportsENS && {
            resolveEnsNameFromAddress,
            resolveAddressFromEnsName,
          })}
          {...props}
          ref={areaRef}
        />
        {showResolvedLabels && !networkSupportsENS && isEnsAttemptedInput && (
          <AlertInline
            message={t('inputWallet.ensAlertWarning')}
            variant="warning"
          />
        )}
        {showResolvedLabels && !error && ensResolved && (
          <AlertInline
            message={t('inputWallet.ensAlertSuccess')}
            variant="success"
          />
        )}
        {showResolvedLabels && !error && addressValidated && (
          <AlertInline
            message={t('inputWallet.addressAlertSuccess')}
            variant="success"
          />
        )}
        {error && <AlertInline message={error} variant="critical" />}
      </>
    );
  }
);

WrappedWalletInput.displayName = 'WrappedWalletInput';
