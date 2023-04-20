import {
  AlertInline,
  ButtonText,
  IconChevronRight,
  IconReload,
  Link,
  Spinner,
  WalletInput,
} from '@aragon/ui-components';
import {isAddress} from 'ethers/lib/utils';
import React, {useCallback, useMemo, useState} from 'react';
import {
  Controller,
  useFormContext,
  useFormState,
  useWatch,
} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useAlertContext} from 'context/alert';
import {useNetwork} from 'context/network';
import {useWallet} from 'hooks/useWallet';
import {SccFormData} from 'pages/demoScc';
import {addVerifiedSmartContract} from 'services/cache';
import {CHAIN_METADATA, TransactionState} from 'utils/constants';
import {handleClipboardActions} from 'utils/library';
import {EtherscanContractResponse} from 'utils/types';
import ModalHeader from './modalHeader';
import {fetchTokenData} from 'services/prices';
import {useApolloClient} from '@apollo/client';
import {getTokenInfo} from 'utils/tokens';
import {useProviders} from 'context/providers';
import {getEtherscanVerifiedContract} from 'services/contractVerification';

type AugmentedEtherscanContractResponse = EtherscanContractResponse & {
  logo?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onBackButtonClicked: () => void;
};

const icons = {
  [TransactionState.WAITING]: undefined,
  [TransactionState.LOADING]: undefined,
  [TransactionState.SUCCESS]: <IconChevronRight />,
  [TransactionState.ERROR]: <IconReload />,
};

// not exactly sure where opening will be happen or if
// these modals will be global modals. For now, keeping
// this as a "controlled" component
const ContractAddressValidation: React.FC<Props> = props => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const client = useApolloClient();
  const {address} = useWallet();
  const {network} = useNetwork();
  const {infura: provider} = useProviders();

  const [verificationState, setVerificationState] = useState<TransactionState>(
    TransactionState.WAITING
  );

  const {control, resetField, setValue, setError} =
    useFormContext<SccFormData>();
  const {errors} = useFormState({control});
  const [addressField, contracts] = useWatch({
    name: ['contractAddress', 'contracts'],
    control,
  });

  const isTransactionSuccessful =
    verificationState === TransactionState.SUCCESS;
  const isTransactionLoading = verificationState === TransactionState.LOADING;

  const label = {
    [TransactionState.WAITING]: t('scc.addressValidation.actionLabelWaiting'),
    [TransactionState.LOADING]: t('scc.addressValidation.actionLabelLoading'),
    [TransactionState.SUCCESS]: t('scc.addressValidation.actionLabelSuccess'),
    [TransactionState.ERROR]: '',
  };

  const setVerifiedContract = useCallback(
    (value: AugmentedEtherscanContractResponse) => {
      if (value) {
        setVerificationState(TransactionState.SUCCESS);

        const verifiedContract = {
          actions: JSON.parse(value.ABI),
          address: addressField,
          name: value.ContractName,
          logo: value.logo,
        };

        setValue('contracts', [...contracts, verifiedContract]);

        // add to storage
        addVerifiedSmartContract(
          verifiedContract,
          address,
          CHAIN_METADATA[network].id
        );
      } else {
        setVerificationState(TransactionState.WAITING);
        setError('contractAddress', {
          type: 'validate',
          message: t('errors.notValidContractAddress'),
        });
      }
    },
    [address, addressField, contracts, network, setError, setValue, t]
  );

  const handleContractValidation = useCallback(async () => {
    setVerificationState(TransactionState.LOADING);

    // TODO: pick up contract logo from different source;
    // currently this is getting token logos from Coingecko
    // only.

    // Getting token info so that Goerli contracts can use the logos
    // of mainnet ones
    const [tokenData, validatedContract] = await Promise.all([
      getTokenInfo(
        addressField,
        provider,
        CHAIN_METADATA[network].nativeCurrency
      ).then(value => {
        return fetchTokenData(addressField, client, network, value.symbol);
      }),
      getEtherscanVerifiedContract(addressField, network),
    ]);

    if (validatedContract) {
      const verifiedContract = {
        ...validatedContract,
        logo: tokenData?.imgUrl,
      };
      setVerifiedContract(verifiedContract);
    }
  }, [addressField, client, network, provider, setVerifiedContract]);

  // clear field when there is a value, else paste
  const handleAdornmentClick = useCallback(
    (value: string, onChange: (value: string) => void) => {
      // when there is a value clear it
      if (value && !isTransactionSuccessful && !isTransactionLoading) {
        onChange('');
        alert(t('alert.chip.inputCleared'));
      } else handleClipboardActions(value, onChange, alert);
    },
    [alert, isTransactionLoading, isTransactionSuccessful, t]
  );

  const addressValidator = (value: string) => {
    // duplication: contract already connected
    const addressExists = contracts.some(
      c => c.address.toLowerCase() === value.toLowerCase()
    );

    if (addressExists) return t('errors.duplicateContractAddress');

    // check if address is valid address string
    if (isAddress(value)) return true;
    else return t('errors.invalidAddress');
  };

  const adornmentText = useMemo(() => {
    if (isTransactionSuccessful || isTransactionLoading)
      return t('labels.copy');
    if (addressField !== '') return t('labels.clear');
    return t('labels.paste');
  }, [addressField, isTransactionLoading, isTransactionSuccessful, t]);

  const isButtonDisabled = useMemo(
    () => errors.contractAddress !== undefined,
    [errors.contractAddress]
  );

  return (
    <ModalBottomSheetSwitcher isOpen={props.isOpen} onClose={props.onClose}>
      <ModalHeader
        title={t('scc.addressValidation.modalTitle')}
        onClose={() => {
          // clear contract address field
          resetField('contractAddress');
          setVerificationState(TransactionState.WAITING);
          props.onClose();
        }}
        onBackButtonClicked={props.onBackButtonClicked}
        showBackButton={
          !(
            verificationState === TransactionState.LOADING ||
            isTransactionSuccessful
          )
        }
        showCloseButton={!isTransactionLoading}
      />
      <Content>
        <DescriptionContainer>
          <Title>{t('scc.addressValidation.title')}</Title>
          <Description>
            {t('scc.addressValidation.description')}{' '}
            <Link
              external
              label={t('labels.etherscan')}
              href={`${CHAIN_METADATA[network].explorer}`}
            />
          </Description>
        </DescriptionContainer>
        <Controller
          name="contractAddress"
          rules={{
            required: t('errors.required.tokenAddress'),
            validate: addressValidator,
          }}
          control={control}
          defaultValue={''}
          render={({
            field: {name, onBlur, onChange, value},
            fieldState: {error},
          }) => (
            <>
              <WalletInput
                mode={error ? 'critical' : 'default'}
                name={name}
                onBlur={onBlur}
                value={value}
                onChange={onChange}
                disabledFilled={isTransactionSuccessful || isTransactionLoading}
                placeholder="0x ..."
                adornmentText={adornmentText}
                onAdornmentClick={() => handleAdornmentClick(value, onChange)}
              />
              <div className="mt-1">
                {error?.message && (
                  <AlertInline label={error.message} mode="critical" />
                )}
              </div>
            </>
          )}
        />
        <ButtonText
          label={label[verificationState]}
          onClick={handleContractValidation}
          iconLeft={
            isTransactionLoading ? (
              <Spinner size="xs" color="white" />
            ) : undefined
          }
          iconRight={icons[verificationState]}
          isActive={isTransactionLoading}
          disabled={isButtonDisabled}
          size="large"
          className="mt-3 w-full"
        />
        {isTransactionSuccessful && (
          <AlertInlineContainer>
            <AlertInline
              mode="success"
              label={t('scc.addressValidation.successLabel', {
                contractName: contracts[contracts.length - 1]?.name,
              })}
            />
          </AlertInlineContainer>
        )}
      </Content>
    </ModalBottomSheetSwitcher>
  );
};

export default ContractAddressValidation;

const Content = styled.div.attrs({className: 'px-2 tablet:px-3 py-3'})``;

const DescriptionContainer = styled.div.attrs({
  className: 'space-y-0.5 mb-1.5',
})``;

const Title = styled.h2.attrs({
  className: 'text-ui-800 ft-text-base font-bold',
})``;

const Description = styled.p.attrs({
  className: 'ft-text-sm text-ui-600 font-normal',
})``;

const AlertInlineContainer = styled.div.attrs({
  className: 'mx-auto mt-2 w-max',
})``;
