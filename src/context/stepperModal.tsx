import React, {useMemo} from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

import {CHAIN_METADATA} from 'utils/constants';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useNetwork} from 'context/network';
import {formatUnits} from 'utils/library';
import {
  AlertInline,
  ButtonText,
  IconChevronRight,
  IconReload,
} from '@aragon/ods-old';
import {
  GenericKeyEnum,
  StepsMap,
  StepStatus,
} from '../hooks/useFunctionStepper';
import StepperModalProgress, {
  StepperLabels,
} from '../components/StepperProgress';

export type BtnLabels = {
  [key in StepStatus]: string | undefined;
};

export interface StepperModalProps<X extends GenericKeyEnum> {
  // state: TransactionState;
  steps: StepsMap<X>;
  globalState: StepStatus;
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
  buttonLabels: BtnLabels;
  buttonLabelSuccess?: string;
  disabledCallback?: boolean;
  stepLabels: StepperLabels<X>;
}

const StepperModal = <X extends GenericKeyEnum>({
  steps,
  globalState,
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
  buttonLabels,
  buttonLabelSuccess,
  disabledCallback,
  stepLabels,
}: StepperModalProps<X>): JSX.Element => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  const nativeCurrency = CHAIN_METADATA[network].nativeCurrency;

  // TODO: temporarily returning error when unable to estimate fees
  // for chain on which contract not deployed
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

  if (!steps) {
    return <></>;
  }

  return (
    <ModalBottomSheetSwitcher
      {...{isOpen, onClose, closeOnDrag}}
      title={title || t('createDAO.review.title')}
      subtitle={subtitle}
    >
      {globalState === StepStatus.WAITING && (
        <>
          <GasCostTableContainer>
            <GasCostEthContainer>
              <NoShrinkVStack>
                <Label>{t('TransactionModal.estimatedFees')}</Label>
                <p className="text-ui-500 text-sm">
                  {t('TransactionModal.maxFee')}
                </p>
              </NoShrinkVStack>
              <VStack>
                <StrongText>
                  <div className="truncate">{formattedAverage}</div>
                  <div>{`${nativeCurrency.symbol}`}</div>
                </StrongText>
                <div className="text-ui-500 flex justify-end space-x-0.5 text-right text-sm">
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
                <p className="text-ui-500 text-right text-sm">{totalCost}</p>
              </VStack>
            </GasTotalCostEthContainer>
          </GasCostTableContainer>
          {gasEstimationError && (
            <AlertInlineContainer>
              <AlertInline
                label={t('TransactionModal.gasEstimationErrorLabel') as string}
                mode="warning"
              />
            </AlertInlineContainer>
          )}
        </>
      )}
      {globalState !== StepStatus.WAITING && (
        <StepsContainer>
          <StepperModalProgress steps={steps} labels={stepLabels} />
          {globalState === StepStatus.LOADING && (
            <AlertInline
              label={t('stepperModal.processWarning')}
              mode="critical"
            />
          )}
        </StepsContainer>
      )}
      {buttonLabels[globalState] !== undefined && (
        <>
          <ButtonContainer>
            <ButtonText
              className="mt-3 w-full"
              label={buttonLabels[globalState]!}
              iconLeft={
                globalState === StepStatus.ERROR ? <IconReload /> : undefined
              }
              iconRight={
                globalState === StepStatus.WAITING ||
                globalState === StepStatus.SUCCESS ? (
                  <IconChevronRight />
                ) : undefined
              }
              disabled={gasEstimationError !== undefined}
              onClick={callback}
            />
          </ButtonContainer>
        </>
      )}
    </ModalBottomSheetSwitcher>
  );
};

export default StepperModal;

const StepsContainer = styled.div.attrs({
  className:
    'px-3 py-3 rounded-b-xl bg-white mx-3 my-3 border-ui-100 rounded-xl flex flex-col gap-3',
})``;

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

const StrongText = styled.p.attrs({
  className: 'font-semibold text-right text-neutral-600 flex space-x-1',
})``;

const Label = styled.p.attrs({
  className: 'text-neutral-600',
})``;
