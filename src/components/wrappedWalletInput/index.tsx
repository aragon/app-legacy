import {AlertInline, WalletInput, WalletInputProps} from '@aragon/ods';
import React, {Ref, forwardRef, useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {useAlertContext} from 'context/alert';
import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {CHAIN_METADATA, ENS_SUPPORTED_NETWORKS} from 'utils/constants/chains';

// delay (in ms) to remove the resolved/verified labels
const RESOLVED_LABEL_DELAY = 800;

type WrappedWalletInputProps = {
  onChange: (...event: unknown[]) => void;
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
      onBlur,
      onChange,
      error,
      resolveLabels = 'disabled',
      ...props
    }: WrappedWalletInputProps,
    ref: Ref<HTMLTextAreaElement> | undefined
  ) => {
    const {t} = useTranslation();
    const {alert} = useAlertContext();
    const {network} = useNetwork();
    const {infura: provider} = useProviders();

    const [ensResolved, setEnsResolved] = useState(false);
    const [addressValidated, setAddressValidated] = useState(false);

    const resolveEnsNameFromAddress = useCallback(
      (address: string | Promise<string>) => provider.lookupAddress(address),
      [provider]
    );

    const resolveAddressFromEnsName = useCallback(
      (ensName: string | Promise<string>) => provider.resolveName(ensName),
      [provider]
    );

    const handleEnsResolved = useCallback(() => {
      setAddressValidated(false);
      setEnsResolved(true);
    }, []);

    const handleAddressValidated = useCallback(() => {
      setEnsResolved(false);
      setAddressValidated(true);
    }, []);

    const handleBlur = useCallback(
      (event: React.FocusEvent<HTMLTextAreaElement, Element>) => {
        if (resolveLabels === 'onBlur') {
          setTimeout(() => {
            setEnsResolved(false);
            setAddressValidated(false);
          }, RESOLVED_LABEL_DELAY);
        }
        onBlur?.(event);
      },
      [onBlur, resolveLabels]
    );

    const networkSupportsENS = ENS_SUPPORTED_NETWORKS.includes(network);
    const showResolvedLabels =
      resolveLabels === 'enabled' || resolveLabels === 'onBlur';

    return (
      <>
        <WalletInput
          blockExplorerURL={CHAIN_METADATA[network].explorer + 'address/'}
          onAddressValidated={handleAddressValidated}
          onBlur={handleBlur}
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
          ref={ref}
        />
        {showResolvedLabels && !networkSupportsENS && (
          <AlertInline
            label={t('inputWallet.ensAlertWarning')}
            mode="warning"
          />
        )}
        {showResolvedLabels && !error && ensResolved && (
          <AlertInline
            label={t('inputWallet.ensAlertSuccess')}
            mode="success"
          />
        )}
        {showResolvedLabels && !error && addressValidated && (
          <AlertInline
            label={t('inputWallet.addressAlertSuccess')}
            mode="success"
          />
        )}
        {error && <AlertInline label={error} mode="critical" />}
      </>
    );
  }
);

WrappedWalletInput.displayName = 'WrappedWalletInput';
