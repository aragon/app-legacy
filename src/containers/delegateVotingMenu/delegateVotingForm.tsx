import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {useWallet} from 'hooks/useWallet';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useTranslation} from 'react-i18next';
import {
  AlertCard,
  CheckboxListItem,
  Label,
  ButtonText,
  Spinner,
  AlertInline,
  IconReload,
  InputValue,
} from '@aragon/ods-old';
import {useDaoToken} from 'hooks/useDaoToken';
import {WrappedWalletInput} from 'components/wrappedWalletInput';
import {useDelegatee} from 'services/aragon-sdk/queries/use-delegatee';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {validateWeb3Address} from 'utils/validators';
import {useProviders} from 'context/providers';
import {Web3Address} from 'utils/library';
import {
  DelegateVotingFormField,
  IDelegateVotingFormValues,
} from './delegateVotingUtils';

export interface IDelegateVotingFormProps {
  initialMode?: 'delegate' | 'reclaim';
  onDelegateTokens: () => void;
  onCancel: () => void;
  status: 'idle' | 'loading' | 'error' | 'success';
}

const getDelegateLabel = (
  isReclaim: boolean,
  isLoading: boolean,
  isError: boolean
) => {
  if (isError) {
    return 'ctaLabelRetry';
  } else if (isReclaim) {
    return isLoading ? 'ctaLabelReclaiming' : 'ctaLabelReclaim';
  } else {
    return isLoading ? 'ctaLabelDelegating' : 'ctaLabelDelegateNow';
  }
};

export const DelegateVotingForm: React.FC<IDelegateVotingFormProps> = props => {
  const {onDelegateTokens, onCancel, initialMode = 'delegate', status} = props;

  const {t} = useTranslation();
  const {address, ensName, isOnWrongNetwork} = useWallet();
  const {setValue, formState, control} =
    useFormContext<IDelegateVotingFormValues>();
  const {api: provider} = useProviders();

  const delegate = useWatch({
    name: DelegateVotingFormField.TOKEN_DELEGATE,
    control: control,
  });
  const [delegateSelection, setDelegateSelection] = useState(initialMode);

  const {data: daoDetails} = useDaoDetailsQuery();
  const {data: daoToken} = useDaoToken(
    daoDetails?.plugins[0].instanceAddress ?? ''
  );

  const {data: delegateData} = useDelegatee(
    {tokenAddress: daoToken?.address as string},
    {enabled: daoToken != null && !isOnWrongNetwork}
  );
  const currentDelegate = delegateData === null ? address : delegateData;

  const handleCancel = () => {
    setDelegateSelection('delegate');
    onCancel();
  };

  const handleReclaimSelection = () => {
    setDelegateSelection('reclaim');
    const newDelegate = {
      address: address as string,
      ensName: ensName != null ? ensName : '',
    };
    setValue(DelegateVotingFormField.TOKEN_DELEGATE, newDelegate);
  };

  const validateAddress = async (value: InputValue) =>
    validateWeb3Address(
      new Web3Address(provider, value.address, value.ensName),
      t('errors.required.walletAddress'),
      t
    );

  // Update delegateSelection on initialMode change
  useEffect(() => {
    setDelegateSelection(initialMode);
  }, [initialMode]);

  const isDelegateValid =
    delegate.address != null &&
    delegate.address !== '' &&
    delegate.address.toLowerCase() !== currentDelegate?.toLowerCase() &&
    formState.errors[DelegateVotingFormField.TOKEN_DELEGATE] == null;

  const isReclaimMode = delegateSelection === 'reclaim';
  const isLoading = status === 'loading';
  const isError = status === 'error';

  const delegateLabel = getDelegateLabel(isReclaimMode, isLoading, isError);

  const ctaIcon = isLoading ? (
    <Spinner size="xs" color="white" />
  ) : isError ? (
    <IconReload />
  ) : undefined;

  const alertLabel = isReclaimMode
    ? 'alertCriticalReclaim'
    : 'alertCriticalDelegate';

  return (
    <div className="flex flex-col gap-6">
      <FormGroup>
        <p className="font-semibold text-neutral-800 ft-text-base">
          {t('modal.delegation.optionsLabel')}
        </p>
        <CheckboxListItem
          label={t('modal.delegation.checkbox.delegateTo')}
          type={!isReclaimMode ? 'active' : 'default'}
          onClick={() => setDelegateSelection('delegate')}
          disabled={isLoading}
        />
        <CheckboxListItem
          label={t('modal.delegation.checkbox.claim')}
          type={isReclaimMode ? 'active' : 'default'}
          onClick={handleReclaimSelection}
          disabled={isLoading}
        />
      </FormGroup>
      <FormGroup>
        <Label
          label={t('modal.delegation.codeInputLabel')}
          helpText={t('modal.delegation.codeInputDesc')}
        />
        <Controller
          name={DelegateVotingFormField.TOKEN_DELEGATE}
          rules={{validate: validateAddress}}
          render={({field, fieldState}) => (
            <WrappedWalletInput
              {...field}
              disabled={isReclaimMode || isLoading}
              error={fieldState.error?.message}
              placeholder={t('modal.delegation.codeInputPlaceholder')}
            />
          )}
        />
        <AlertCard
          mode="info"
          title={t('modal.delegation.alertCard.title')}
          helpText={t('modal.delegation.alertCard.desc', {
            tokenSymbol: daoToken?.symbol,
          })}
        />
      </FormGroup>
      <FormGroup className="items-center">
        <ButtonText
          className="w-full"
          label={t(`modal.delegation.${delegateLabel}`)}
          size="large"
          disabled={!isDelegateValid}
          isActive={isLoading}
          mode="primary"
          iconLeft={ctaIcon}
          onClick={onDelegateTokens}
        />
        <ButtonText
          className="w-full"
          label={t('labels.cancel')}
          size="large"
          mode="secondary"
          onClick={handleCancel}
        />
        {isError && (
          <AlertInline
            label={t(`modal.delegation.${alertLabel}`)}
            mode="critical"
          />
        )}
      </FormGroup>
    </div>
  );
};

const FormGroup = styled.div.attrs({
  className: 'flex flex-col gap-3',
})``;
