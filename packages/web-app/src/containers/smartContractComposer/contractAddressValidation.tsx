import React, {useCallback, useState} from 'react';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import ModalHeader from './modalHeader';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {
  AlertInline,
  ButtonText,
  IconChevronRight,
  IconReload,
  Link,
  Spinner,
  ValueInput,
} from '@aragon/ui-components';
import {handleClipboardActions} from 'utils/library';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {CHAIN_METADATA, TransactionState} from 'utils/constants';
import {useNetwork} from 'context/network';
import {validateContract} from 'utils/validators';
import {useProviders} from 'context/providers';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onBackButtonClicked: () => void;
};

const icons = {
  [TransactionState.WAITING]: undefined,
  [TransactionState.LOADING]: <Spinner size="xs" color="white" />,
  [TransactionState.SUCCESS]: <IconChevronRight />,
  [TransactionState.ERROR]: <IconReload />,
};
// not exactly sure where opening will be happen or if
// these modals will be global modals. For now, keeping
// this as a "controlled" component
const ContractAddressValidation: React.FC<Props> = props => {
  const {t} = useTranslation();
  const [transactionState, setTransactionState] = useState<TransactionState>(
    TransactionState.WAITING
  );
  const {control} = useFormContext();
  const {network} = useNetwork();
  const {infura: provider} = useProviders();
  const addressField = useWatch({
    name: 'contractAddress',
    control,
  });

  const label = {
    [TransactionState.WAITING]: t('scc.addressValidation.actionLabelWaiting'),
    [TransactionState.LOADING]: t('scc.addressValidation.actionLabelLoading'),
    [TransactionState.SUCCESS]: t('scc.addressValidation.actionLabelSuccess'),
    [TransactionState.ERROR]: t('scc.addressValidation.tryAgain'),
  };

  const setContractValid = useCallback((value: boolean) => {
    if (value) setTransactionState(TransactionState.SUCCESS);
    else setTransactionState(TransactionState.ERROR);
  }, []);

  return (
    <ModalBottomSheetSwitcher isOpen={props.isOpen} onClose={props.onClose}>
      <ModalHeader
        title={t('scc.addressValidation.modalTitle') as string}
        onClose={props.onClose}
        onBackButtonClicked={props.onBackButtonClicked}
      />
      <Content>
        <DescriptionContainer>
          <Title>{t('scc.addressValidation.title')}</Title>
          <Description>
            {t('scc.addressValidation.description')}{' '}
            <Link
              external
              label={t('labels.etherscan') as string}
              href={`${CHAIN_METADATA[network].explorer}`}
            />
          </Description>
        </DescriptionContainer>
        <Controller
          name="contractAddress"
          control={control}
          rules={{
            required: t('errors.required.tokenAddress') as string,
          }}
          defaultValue={''}
          render={({
            field: {name, onBlur, onChange, value, ref},
            fieldState: {error},
          }) => (
            <>
              <ValueInput
                mode={error ? 'critical' : 'default'}
                ref={ref}
                name={name}
                value={value}
                onBlur={onBlur}
                onChange={onChange}
                placeholder="0x ..."
                adornmentText={value ? t('labels.copy') : t('labels.paste')}
                onAdornmentClick={() =>
                  handleClipboardActions(value, onChange, alert)
                }
              />
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </>
          )}
        />
        <ButtonText
          label={label[transactionState] as string}
          onClick={async () => {
            setTransactionState(TransactionState.LOADING);
            await validateContract(addressField, provider, setContractValid);
          }}
          iconLeft={icons[transactionState]}
          isActive={transactionState === TransactionState.LOADING}
          disabled={addressField === ''}
          size="large"
          className="mt-3 w-full"
        />
        {transactionState === TransactionState.SUCCESS && (
          <AlertInlineContainer>
            <AlertInline
              label={t('scc.addressValidation.successLabel') as string}
              mode="success"
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
