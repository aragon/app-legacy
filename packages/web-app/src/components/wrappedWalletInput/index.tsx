import {
  AlertInline,
  InputValue,
  WalletInput,
  WalletInputProps,
} from '@aragon/ui-components';
import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {useAlertContext} from 'context/alert';
import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {CHAIN_METADATA, ENS_SUPPORTED_NETWORKS} from 'utils/constants/chains';

type WrappedWalletInputProps = {
  onChange: (...event: unknown[]) => void;
  error?: string;
  showResolvedLabels?: boolean;
} & Omit<WalletInputProps, 'onValueChange'>;

/**
 * This component bootstraps the WalletInput from the ui-components
 * with the proper alerts (inline and chip), ENS domain resolvers etc
 */
export const WrappedWalletInput: React.FC<WrappedWalletInputProps> = ({
  onChange,
  error,
  showResolvedLabels = true,
  ...props
}) => {
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

  const handleValueChanged = useCallback(
    (value: InputValue, onChange: (...event: unknown[]) => void) =>
      onChange(value),
    []
  );

  const handleEnsResolved = useCallback(() => {
    setAddressValidated(false);
    setEnsResolved(true);
  }, []);

  const handleAddressValidated = useCallback(() => {
    setEnsResolved(false);
    setAddressValidated(true);
  }, []);

  const networkSupportsENS = ENS_SUPPORTED_NETWORKS.includes(network);

  return (
    <>
      <WalletInput
        blockExplorerURL={CHAIN_METADATA[network].explorer + 'address/'}
        onAddressValidated={handleAddressValidated}
        onEnsResolved={handleEnsResolved}
        onClearButtonClick={() => alert(t('alert.chip.inputCleared'))}
        onCopyButtonClick={() => alert(t('alert.chip.inputCopied'))}
        onPasteButtonClick={() => alert(t('alert.chip.inputPasted'))}
        onValueChange={value => handleValueChanged(value, onChange)}
        placeholder={networkSupportsENS ? t('inputWallet.placeholder') : '0x…'}
        {...(networkSupportsENS && {
          resolveEnsNameFromAddress,
          resolveAddressFromEnsName,
        })}
        {...props}
      />
      {showResolvedLabels && !networkSupportsENS && (
        <AlertInline label={t('inputWallet.ensAlertWarning')} mode="warning" />
      )}
      {showResolvedLabels && !error && ensResolved && (
        <AlertInline label={t('inputWallet.ensAlertSuccess')} mode="success" />
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
};
