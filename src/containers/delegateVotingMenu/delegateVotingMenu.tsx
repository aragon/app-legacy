import React, {useEffect, useState} from 'react';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useGlobalModalContext} from 'context/globalModals';
import {useWallet} from 'hooks/useWallet';
import {LoginRequired} from 'containers/walletMenu/LoginRequired';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {Address, useBalance, useEnsName} from 'wagmi';
import {useTranslation} from 'react-i18next';
import {useDaoToken} from 'hooks/useDaoToken';
import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';
import {useDelegatee} from 'services/aragon-sdk/queries/use-delegatee';
import {useDelegateTokens} from 'services/aragon-sdk/mutations/use-delegate-tokens';
import {DelegateTokensStepValue} from '@aragon/sdk-client';
import {DelegateVotingForm} from './delegateVotingForm';
import {DelegateVotingSuccess} from './delegateVotingSuccess';
import {aragonSdkQueryKeys} from 'services/aragon-sdk/query-keys';
import {useQueryClient} from '@tanstack/react-query';
import {FormProvider, UseFormProps, useForm, useWatch} from 'react-hook-form';
import {
  DelegateVotingFormField,
  IDelegateVotingFormValues,
} from './delegateVotingUtils';
import {aragonBackendQueryKeys} from 'services/aragon-backend/query-keys';

const buildFormSettings = (
  delegateAddress = ''
): UseFormProps<IDelegateVotingFormValues> => ({
  mode: 'onChange',
  defaultValues: {
    [DelegateVotingFormField.TOKEN_DELEGATE]: {
      address: delegateAddress,
      ensName: '',
    },
  },
});

type DelegateVotingMenuState = {
  /**
   * Initialises the form in reclaim mode when set to true.
   */
  reclaimMode?: boolean;
  /**
   * Initial address to be set on the delegate form field.
   */
  delegate?: string;
};

export const DelegateVotingMenu: React.FC = () => {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const {isOpen, close, open, modalState} =
    useGlobalModalContext<DelegateVotingMenuState>('delegateVoting');
  const formSettings = buildFormSettings(modalState?.delegate);
  const formValues = useForm<IDelegateVotingFormValues>(formSettings);
  const {setValue, control} = formValues;
  const delegate = useWatch({
    name: DelegateVotingFormField.TOKEN_DELEGATE,
    control: control,
  });

  const {
    isConnected,
    isModalOpen: isWeb3ModalOpen,
    network,
    address,
    ensName,
    isOnWrongNetwork,
  } = useWallet();

  const [txHash, setTxHash] = useState<string>();

  const {data: daoDetails} = useDaoDetailsQuery();
  const {data: daoToken} = useDaoToken(
    daoDetails?.plugins[0].instanceAddress ?? ''
  );

  const {data: tokenBalance, isLoading: isLoadingBalance} = useBalance({
    address: address as Address,
    token: daoToken?.address as Address,
    chainId: CHAIN_METADATA[network as SupportedNetworks].id,
    enabled: address != null && daoToken != null,
  });

  const {data: delegateData} = useDelegatee(
    {tokenAddress: daoToken?.address as string},
    {enabled: daoToken != null && !isOnWrongNetwork}
  );

  // The useDelegatee hook returns null when current delegate is connected address
  const currentDelegate =
    delegateData === null ? (address as string) : delegateData;

  const {data: delegateEns} = useEnsName({
    address: currentDelegate as Address,
    enabled: currentDelegate != null,
  });
  const currentDelegateEns = delegateEns ?? '';

  const handleCloseMenu = () => {
    setValue(DelegateVotingFormField.TOKEN_DELEGATE, {
      address: currentDelegate ?? '',
      ensName: currentDelegateEns,
    });
    setTxHash(undefined);
    close();
    resetDelegateProcess();
  };

  const handleCloseLogin = () => {
    if (!isWeb3ModalOpen) {
      close();
    }
  };

  const invalidateDelegateQueries = () => {
    const baseParams = {
      address: address as string,
      network: network as SupportedNetworks,
    };
    const params = {tokenAddress: daoToken?.address as string};
    const delegateKey = aragonSdkQueryKeys.delegatee(baseParams, params);
    const votingPowerKey = aragonSdkQueryKeys.votingPower({
      address: baseParams.address,
      tokenAddress: daoToken?.address as string,
    });
    const membersKey = aragonSdkQueryKeys.members({
      pluginAddress: daoDetails?.plugins[0].instanceAddress as string,
    });
    const graphQlKey = aragonBackendQueryKeys.tokenHolders({
      network: network as SupportedNetworks,
      tokenAddress: daoToken?.address as string,
    });
    queryClient.invalidateQueries(delegateKey);
    queryClient.invalidateQueries(votingPowerKey);
    queryClient.invalidateQueries(membersKey);
    queryClient.invalidateQueries(graphQlKey);
  };

  const handleDelegateTokensSuccess = async (
    iterator: AsyncGenerator<DelegateTokensStepValue>
  ) => {
    let delegateHash: string | undefined;

    for await (const step of iterator) {
      if (step.key === 'delegating') {
        delegateHash = step.txHash;
      } else if (step.key === 'done') {
        invalidateDelegateQueries();
        setTxHash(delegateHash);
      }
    }
  };

  const {
    mutate: delegateTokens,
    reset: resetDelegateProcess,
    status: delegationStatus,
  } = useDelegateTokens({onSuccess: handleDelegateTokensSuccess});

  const handleDelegateTokens = () => {
    if (daoToken == null) {
      return;
    }

    delegateTokens({
      tokenAddress: daoToken.address,
      delegatee: delegate.address,
    });
  };

  useEffect(() => {
    if (
      currentDelegate != null &&
      modalState?.delegate == null &&
      !modalState?.reclaimMode
    ) {
      setValue(DelegateVotingFormField.TOKEN_DELEGATE, {
        address: currentDelegate,
        ensName: currentDelegateEns,
      });
    }
  }, [
    setValue,
    currentDelegate,
    currentDelegateEns,
    modalState?.delegate,
    modalState?.reclaimMode,
  ]);

  // Set the token-delegate form field to connected address when the dialog
  // is opened in reclaim mode
  useEffect(() => {
    if (modalState?.reclaimMode && address != null) {
      setValue(DelegateVotingFormField.TOKEN_DELEGATE, {
        address,
        ensName: ensName ?? '',
      });
    }
  }, [modalState?.reclaimMode, address, ensName, setValue]);

  // Update the token-delegate field when the delegate modal state is set
  useEffect(() => {
    if (modalState?.delegate != null) {
      setValue(DelegateVotingFormField.TOKEN_DELEGATE, {
        address: modalState.delegate,
        ensName: '',
      });
    }
  }, [modalState?.delegate, setValue]);

  // Open wrong-network menu when user is on the wrong network
  useEffect(() => {
    if (isConnected && isOpen && isOnWrongNetwork) {
      open('network');
    }
  }, [isConnected, isOpen, isOnWrongNetwork, open]);

  // Open gating menu when user has no tokens for this DAO
  useEffect(() => {
    if (
      isConnected &&
      isOpen &&
      !isLoadingBalance &&
      !isOnWrongNetwork &&
      tokenBalance?.value === 0n
    ) {
      open('gating');
    }
  }, [
    isConnected,
    tokenBalance?.value,
    isLoadingBalance,
    isOnWrongNetwork,
    isOpen,
    open,
  ]);

  if (!isConnected && isOpen) {
    return <LoginRequired isOpen={true} onClose={handleCloseLogin} />;
  }

  return (
    <ModalBottomSheetSwitcher
      onClose={handleCloseMenu}
      isOpen={isOpen}
      title={t('modal.delegation.label')}
    >
      <FormProvider {...formValues}>
        <div className="px-2 py-3">
          {txHash != null ? (
            <DelegateVotingSuccess
              txHash={txHash}
              delegate={delegate}
              tokenBalance={tokenBalance?.formatted ?? '0'}
              onClose={handleCloseMenu}
            />
          ) : (
            <DelegateVotingForm
              initialMode={modalState?.reclaimMode ? 'reclaim' : 'delegate'}
              onDelegateTokens={handleDelegateTokens}
              onCancel={handleCloseMenu}
              status={delegationStatus}
            />
          )}
        </div>
      </FormProvider>
    </ModalBottomSheetSwitcher>
  );
};
