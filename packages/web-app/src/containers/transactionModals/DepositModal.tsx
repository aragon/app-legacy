import React, {useMemo, useEffect, useState} from 'react';
import {
  AlertInline,
  ButtonText,
  IconReload,
  LinearProgress,
  Spinner,
} from '@aragon/ui-components';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {CHAIN_METADATA, TransactionState} from 'utils/constants';
import {useNetwork} from 'context/network';
import {formatUnits} from 'utils/library';
import {isNativeToken} from 'utils/tokens';
import {modalParamsType} from 'context/deposit';

type TransactionModalProps = {
  state: TransactionState;
  handleDeposit: () => void;
  handleApproval?: () => void;
  isOpen: boolean;
  onClose: () => void;
  closeOnDrag: boolean;
  currentStep: number;
  includeApproval?: boolean;
  maxFee: BigInt | undefined;
  averageFee: BigInt | undefined;
  ethPrice: number;
  depositAmount: BigInt;
  tokenAddress: string;
  modalParams: modalParamsType;
  handleOpenModal: () => void;
};

const icons = {
  [TransactionState.WAITING]: undefined,
  [TransactionState.LOADING]: <Spinner size="xs" color="white" />,
  [TransactionState.SUCCESS]: undefined,
  [TransactionState.ERROR]: <IconReload />,
};

const DepositModal: React.FC<TransactionModalProps> = ({
  state = TransactionState.WAITING,
  handleDeposit,
  handleApproval,
  isOpen,
  onClose,
  closeOnDrag,
  currentStep,
  includeApproval = false,
  maxFee,
  averageFee,
  ethPrice,
  depositAmount,
  tokenAddress,
  modalParams,
  handleOpenModal,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const [updateBlink, setUpdateBlink] = useState(false);

  const label = {
    [TransactionState.WAITING]: t('TransactionModal.signDeposit'),
    [TransactionState.LOADING]: t('TransactionModal.signDeposit'),
    [TransactionState.SUCCESS]: t('TransactionModal.goToFinance'),
    [TransactionState.ERROR]: t('TransactionModal.tryAgain'),
  };

  const nativeCurrency = CHAIN_METADATA[network].nativeCurrency;

  const formattedAmount =
    depositAmount === undefined
      ? undefined
      : Number(formatUnits(depositAmount.toString(), nativeCurrency.decimals));

  const tokenPrice = isNativeToken(tokenAddress)
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(ethPrice * (formattedAmount as number))
    : undefined;

  const formattedMax =
    maxFee === undefined
      ? undefined
      : `${Number(
          formatUnits(maxFee.toString(), nativeCurrency.decimals)
        ).toFixed(8)} ${nativeCurrency.symbol}`;

  useEffect(() => {
    setUpdateBlink(true);
    setTimeout(() => {
      setUpdateBlink(false);
    }, 1000);
  }, [averageFee]);

  const handleApproveClick = () => {
    handleApproval?.();
  };

  const handleButtonClick = () => {
    switch (state) {
      case TransactionState.SUCCESS:
        onClose();
        break;
      case TransactionState.ERROR:
        handleOpenModal();
        break;
      case TransactionState.LOADING:
        break;
      default:
        handleDeposit();
    }
  };

  // TODO: temporarily returning error when unable to estimate fees
  // for chain on which contract not deployed
  const [totalCost, totalAmount, formattedAverage] = useMemo(
    () =>
      averageFee === undefined
        ? [
            'Error calculating costs',
            'Error calculating costs',
            'Error estimating fees',
          ]
        : [
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(
              (Number(
                formatUnits(averageFee.toString(), nativeCurrency.decimals)
              ) +
                (isNativeToken(tokenAddress)
                  ? (formattedAmount as number)
                  : 0)) *
                ethPrice
            ),
            `${(
              Number(
                formatUnits(averageFee.toString(), nativeCurrency.decimals)
              ) +
              (isNativeToken(tokenAddress) ? (formattedAmount as number) : 0)
            ).toFixed(8)} ${nativeCurrency.symbol}`,
            `${Number(
              formatUnits(averageFee.toString(), nativeCurrency.decimals)
            ).toFixed(8)} ${nativeCurrency.symbol}`,
          ],
    [
      averageFee,
      nativeCurrency.decimals,
      nativeCurrency.symbol,
      tokenAddress,
      formattedAmount,
      ethPrice,
    ]
  );

  return (
    <ModalBottomSheetSwitcher
      {...{isOpen, onClose, closeOnDrag}}
      title={t('TransactionModal.signDeposit')}
    >
      <GasCostTableContainer>
        <DepositAmountContainer>
          <VStack>
            <Label>{t('labels.deposit')}</Label>
          </VStack>
          <VStack>
            <StrongText>
              {formattedAmount} {modalParams?.tokenSymbol || ''}
            </StrongText>
            <LightText>{tokenPrice}</LightText>
          </VStack>
        </DepositAmountContainer>
        <GasCostEthContainer>
          <VStack>
            <VStack>
              <Label>{t('TransactionModal.estimatedFees')}</Label>
              <p className="text-sm text-ui-500">
                {t('TransactionModal.maxFee')}
              </p>
            </VStack>
          </VStack>
          <VStack>
            <StrongText {...{updateBlink}}>{formattedAverage}</StrongText>
            <LightText {...{updateBlink}}>{formattedMax}</LightText>
          </VStack>
        </GasCostEthContainer>

        <GasCostUSDContainer>
          <Label>{t('TransactionModal.totalCost')}</Label>
          <VStack>
            <StrongText {...{updateBlink}}>{totalAmount}</StrongText>
            <LightText {...{updateBlink}}>{totalCost}</LightText>
          </VStack>
        </GasCostUSDContainer>
      </GasCostTableContainer>
      <ApproveTxContainer>
        {includeApproval && (
          <>
            <WizardContainer>
              <PrimaryColoredText>
                {currentStep === 1
                  ? t('TransactionModal.approveToken')
                  : t('TransactionModal.signDeposit')}
              </PrimaryColoredText>
              <p className="text-ui-400">{`${t(
                'labels.step'
              )} ${currentStep} ${t('labels.of')} 2`}</p>
            </WizardContainer>

            <LinearProgress max={2} value={currentStep} />

            <ApproveSubtitle>
              {t('TransactionModal.approveSubtitle')}
            </ApproveSubtitle>
          </>
        )}
        <HStack>
          {includeApproval && (
            <ButtonText
              className="mt-3 w-full"
              label={t('TransactionModal.approveToken')}
              iconLeft={currentStep === 1 ? icons[state] : undefined}
              onClick={handleApproveClick}
              disabled={currentStep !== 1}
            />
          )}
          <ButtonText
            className={includeApproval ? 'mt-3 w-full' : 'w-full'}
            label={label[state]}
            iconLeft={currentStep === 2 ? icons[state] : undefined}
            onClick={handleButtonClick}
            disabled={currentStep !== 2}
          />
        </HStack>

        {state === TransactionState.ERROR && (
          <AlertInlineContainer>
            <AlertInline
              label={t('TransactionModal.errorLabel')}
              mode="critical"
            />
          </AlertInlineContainer>
        )}
        {state === TransactionState.SUCCESS && (
          <AlertInlineContainer>
            <AlertInline
              label={t('TransactionModal.successLabel')}
              mode="success"
            />
          </AlertInlineContainer>
        )}
      </ApproveTxContainer>
    </ModalBottomSheetSwitcher>
  );
};

export default DepositModal;

type StrongLightTextProps = {
  updateBlink?: boolean;
};

const GasCostTableContainer = styled.div.attrs({
  className: 'm-3 bg-white rounded-xl border border-ui-100',
})``;

const GasCostEthContainer = styled.div.attrs({
  className: 'flex justify-between py-1.5 px-2',
})``;

const DepositAmountContainer = styled.div.attrs({
  className: 'flex justify-between py-1.5 px-2 border-ui-100',
})`
  border-bottom-width: 2px;
`;

const GasCostUSDContainer = styled.div.attrs({
  className: 'flex justify-between py-1.5 px-2 rounded-b-xl bg-ui-100',
})``;

const ApproveTxContainer = styled.div.attrs({
  className: 'p-3 bg-white rounded-b-xl',
})``;

const AlertInlineContainer = styled.div.attrs({
  className: 'mx-auto mt-2 w-max',
})``;

const HStack = styled.div.attrs({
  className: 'flex gap-x-2',
})``;

const WizardContainer = styled.div.attrs({
  className: 'flex justify-between mb-1 text-sm',
})``;

const VStack = styled.div.attrs({
  className: 'space-y-0.25',
})``;

const StrongText = styled.p.attrs({
  className: 'font-bold text-right text-ui-600',
})<StrongLightTextProps>`
  ${props =>
    props.updateBlink &&
    `
  animation: blinker 1s linear infinite;
  @keyframes blinker {
    50% {
      opacity: 0;
    }
  }
  `}
`;

const LightText = styled.p.attrs({
  className: 'text-sm text-right text-ui-500',
})<StrongLightTextProps>`
  ${props =>
    props.updateBlink &&
    `
  animation: blinker 1s linear infinite;
  @keyframes blinker {
    50% {
      opacity: 0;
    }
  }
  `}
`;

const Label = styled.p.attrs({
  className: 'text-ui-600',
})``;

const PrimaryColoredText = styled.p.attrs({
  className: 'font-bold text-primary-500',
})``;

const ApproveSubtitle = styled.p.attrs({
  className: 'mt-1 text-sm text-ui-600',
})``;
