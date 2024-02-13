import React, {useMemo} from 'react';
import {AlertInline} from '@aragon/ods-old';
import {Button, IconType} from '@aragon/ods';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

import {CHAIN_METADATA, TransactionState} from 'utils/constants';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useNetwork} from 'context/network';
import {formatUnits} from 'utils/library';

export type TransactionStateLabels = {
  [K in TransactionState]?: string;
};

type PublishModalProps = {
  state: TransactionState;
  callback: () => void;
  isOpen: boolean;
  onClose: () => void;
  closeOnDrag: boolean;
  maxFee: BigInt | undefined;
  averageFee: BigInt | undefined;
  gasEstimationError?: Error;
  tokenPrice: number;
  title?: string;
  subtitle?: string;
  buttonStateLabels?: TransactionStateLabels;
  disabledCallback?: boolean;
};

const icons = {
  [TransactionState.WAITING]: undefined,
  [TransactionState.LOADING]: undefined,
  [TransactionState.SUCCESS]: undefined,
  [TransactionState.INCORRECT_URI]: undefined,
  [TransactionState.ERROR]: IconType.RELOAD,
};

const PublishModal: React.FC<PublishModalProps> = ({
  state = TransactionState.LOADING,
  callback,
  isOpen,
  onClose,
  closeOnDrag,
  maxFee,
  averageFee,
  gasEstimationError,
  tokenPrice,
  title,
  subtitle,
  buttonStateLabels,
  disabledCallback,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  const labels = {
    [TransactionState.WAITING]:
      buttonStateLabels?.WAITING ?? t('TransactionModal.publishDaoButtonLabel'),
    [TransactionState.LOADING]:
      buttonStateLabels?.LOADING ?? t('TransactionModal.waiting'),
    [TransactionState.SUCCESS]:
      buttonStateLabels?.SUCCESS ?? t('TransactionModal.goToProposal'),
    [TransactionState.ERROR]:
      buttonStateLabels?.ERROR ?? t('TransactionModal.tryAgain'),
    [TransactionState.INCORRECT_URI]: buttonStateLabels?.INCORRECT_URI ?? '',
  };

  const nativeCurrency = CHAIN_METADATA[network].nativeCurrency;

  const [totalCost, formattedAverage] = useMemo(
    () =>
      averageFee === undefined
        ? ['Error calculating costs', 'Error estimating fees']
        : [
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(
              Number(
                formatUnits(averageFee.toString(), nativeCurrency.decimals)
              ) * tokenPrice
            ),
            `${formatUnits(averageFee.toString(), nativeCurrency.decimals)}`,
          ],
    [averageFee, nativeCurrency.decimals, tokenPrice]
  );

  const formattedMax =
    maxFee === undefined
      ? undefined
      : `${formatUnits(maxFee.toString(), nativeCurrency.decimals)}`;

  return (
    <ModalBottomSheetSwitcher
      {...{isOpen, onClose, closeOnDrag}}
      title={title || t('createDAO.review.title')}
      subtitle={subtitle}
    >
      <GasCostTableContainer>
        <GasCostEthContainer>
          <NoShrinkVStack>
            <Label>{t('TransactionModal.estimatedFees')}</Label>
            <p className="text-sm leading-normal text-neutral-500">
              {t('TransactionModal.maxFee')}
            </p>
          </NoShrinkVStack>
          <VStack>
            <StrongText>
              <div className="truncate">{formattedAverage}</div>
              <div>{`${nativeCurrency.symbol}`}</div>
            </StrongText>
            <div className="flex justify-end space-x-1 text-right text-sm leading-normal text-neutral-500">
              <div className="truncate">{formattedMax}</div>
              <div>{`${nativeCurrency.symbol}`}</div>
            </div>
          </VStack>
        </GasCostEthContainer>

        <GasTotalCostEthContainer>
          <NoShrinkVStack>
            <Label>{t('TransactionModal.totalCost')}</Label>
          </NoShrinkVStack>
          <VStack>
            <StrongText>
              <div className="truncate">{formattedAverage}</div>
              <div>{`${nativeCurrency.symbol}`}</div>
            </StrongText>
            <p className="text-right text-sm leading-normal text-neutral-500">
              {totalCost}
            </p>
          </VStack>
        </GasTotalCostEthContainer>
      </GasCostTableContainer>
      <ButtonContainer>
        <Button
          size="md"
          variant="primary"
          className="mt-6 w-full"
          state={state === TransactionState.LOADING ? 'loading' : undefined}
          iconLeft={icons[state]}
          onClick={callback}
          disabled={disabledCallback}
        >
          {labels[state]}
        </Button>
        {state === TransactionState.SUCCESS && (
          <AlertInlineContainer>
            <AlertInline
              label={t('TransactionModal.successLabel')}
              mode="success"
            />
          </AlertInlineContainer>
        )}
        {state === TransactionState.ERROR && (
          <AlertInlineContainer>
            <AlertInline
              label={t('TransactionModal.errorLabel')}
              mode="critical"
            />
          </AlertInlineContainer>
        )}
        {gasEstimationError && (
          <AlertInlineContainer>
            <AlertInline
              label={t('TransactionModal.gasEstimationErrorLabel')}
              mode="warning"
            />
          </AlertInlineContainer>
        )}
      </ButtonContainer>
    </ModalBottomSheetSwitcher>
  );
};

export default PublishModal;

const GasCostTableContainer = styled.div.attrs({
  className: 'm-6 bg-neutral-0 rounded-xl border border-neutral-100',
})``;

const GasCostEthContainer = styled.div.attrs({
  className: 'flex justify-between py-3 px-4 space-x-8',
})``;

const GasTotalCostEthContainer = styled.div.attrs({
  className: 'flex justify-between py-3 px-4 rounded-b-xl bg-neutral-100',
})``;

const AlertInlineContainer = styled.div.attrs({
  className: 'mx-auto mt-4 w-max',
})``;

const ButtonContainer = styled.div.attrs({
  className: 'px-6 pb-6 rounded-b-xl',
})``;

const NoShrinkVStack = styled.div.attrs({
  className: 'space-y-0.5 shrink-0',
})``;

const VStack = styled.div.attrs({
  className: 'space-y-0.5 overflow-hidden',
})``;

const StrongText = styled.div.attrs({
  className: 'font-semibold text-right text-neutral-600 flex space-x-1',
})``;

const Label = styled.p.attrs({
  className: 'text-neutral-600',
})``;
