import React, {useMemo} from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {Button, AlertInline, IconType} from '@aragon/ods';

import {CHAIN_METADATA} from 'utils/constants';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useNetwork} from 'context/network';
import {formatUnits} from 'utils/library';
import {StepsMap, StepStatus} from '../hooks/useFunctionStepper';
import {
  StepperModalProgress,
  StepperLabels,
} from '../components/stepperProgress';

export type BtnLabels = {
  [key in StepStatus]: string | undefined;
};

export interface StepperModalProps<TStepKey extends string> {
  // state: TransactionState;
  steps: StepsMap<TStepKey>;
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
  stepLabels: StepperLabels<TStepKey>;
}

const StepperModal = <TStepKey extends string>({
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
  stepLabels,
}: StepperModalProps<TStepKey>): JSX.Element => {
  const {t} = useTranslation();
  const {network} = useNetwork();

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

  if (!steps) {
    return <></>;
  }

  // If global state is error, find the first step with error message
  let errorMessage = '';
  if (globalState === StepStatus.ERROR) {
    for (const key in steps) {
      if (steps[key].errorMessage) {
        errorMessage = steps[key].errorMessage!;
      }
    }
  }

  return (
    <ModalBottomSheetSwitcher
      {...{isOpen, onClose, closeOnDrag}}
      title={title}
      subtitle={subtitle}
    >
      {globalState === StepStatus.WAITING && (
        <>
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
          {gasEstimationError && (
            <AlertInlineContainer>
              <AlertInline
                message={
                  t('TransactionModal.gasEstimationErrorLabel') as string
                }
                variant="warning"
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
              message={t('createDAO.deployDAO.alertCritical.dontClosePage')}
              variant="critical"
            />
          )}
          {globalState === StepStatus.ERROR && (
            <AlertInline message={errorMessage} variant="critical" />
          )}
        </StepsContainer>
      )}
      {buttonLabels[globalState] !== undefined && (
        <>
          <ButtonContainer>
            <Button
              size="md"
              variant="primary"
              className="mt-3 w-full"
              iconLeft={
                globalState === StepStatus.ERROR ? IconType.RELOAD : undefined
              }
              iconRight={
                globalState === StepStatus.WAITING ||
                globalState === StepStatus.SUCCESS
                  ? IconType.CHEVRON_RIGHT
                  : undefined
              }
              disabled={gasEstimationError !== undefined}
              onClick={callback}
            >
              {buttonLabels[globalState]!}
            </Button>
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
  className: 'flex justify-between py-3 px-4 space-TStepKey-8',
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
  className: 'font-semibold text-right text-neutral-600 flex space-TStepKey-1',
})``;

const Label = styled.p.attrs({
  className: 'text-neutral-600',
})``;
