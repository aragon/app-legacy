import React, {useMemo} from 'react';
import {
  AlertInline,
  ButtonText,
  IconReload,
  Spinner,
} from '@aragon/ui-components';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

import {CHAIN_METADATA, TransactionState} from 'utils/constants';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useNetwork} from 'context/network';
import {formatUnits} from 'utils/library';
import {abbreviateTokenAmount} from 'utils/tokens';

type PublishModalProps = {
  state: TransactionState;
  callback: () => void;
  isOpen: boolean;
  onClose: () => void;
  closeOnDrag: boolean;
  maxFee: BigInt | undefined;
  averageFee: BigInt | undefined;
  tokenPrice: number;
  title?: string;
  buttonLabel?: string;
  buttonLabelSuccess?: string;
};

const icons = {
  [TransactionState.WAITING]: undefined,
  [TransactionState.LOADING]: <Spinner size="xs" color="white" />,
  [TransactionState.SUCCESS]: undefined,
  [TransactionState.ERROR]: <IconReload />,
};

const PublishModal: React.FC<PublishModalProps> = ({
  state = TransactionState.LOADING,
  callback,
  isOpen,
  onClose,
  closeOnDrag,
  maxFee,
  averageFee,
  tokenPrice,
  title,
  buttonLabel,
  buttonLabelSuccess,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  const label = {
    [TransactionState.WAITING]:
      buttonLabel || t('TransactionModal.publishDaoButtonLabel'),
    [TransactionState.LOADING]: t('TransactionModal.waiting'),
    [TransactionState.SUCCESS]:
      buttonLabelSuccess || t('TransactionModal.dismiss'),
    [TransactionState.ERROR]: t('TransactionModal.tryAgain'),
  };

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
            `${abbreviateTokenAmount(
              formatUnits(averageFee.toString(), nativeCurrency.decimals)
            )}
           ${nativeCurrency.symbol}`,
          ],
    [averageFee, nativeCurrency.decimals, nativeCurrency.symbol, tokenPrice]
  );

  const formattedMax =
    maxFee === undefined
      ? undefined
      : `${abbreviateTokenAmount(
          formatUnits(maxFee.toString(), nativeCurrency.decimals)
        )} ${nativeCurrency.symbol}`;

  return (
    <ModalBottomSheetSwitcher
      {...{isOpen, onClose, closeOnDrag}}
      title={title || t('TransactionModal.publishDao')}
    >
      <GasCostTableContainer>
        <GasCostEthContainer>
          <VStack>
            <Label>{t('TransactionModal.estimatedFees')}</Label>
            <p className="text-sm text-ui-500">
              {t('TransactionModal.maxFee')}
            </p>
          </VStack>
          <VStack>
            <StrongText>{formattedAverage}</StrongText>
            <p className="text-sm text-right text-ui-500">{formattedMax}</p>
          </VStack>
        </GasCostEthContainer>

        <GasTotalCostEthContainer>
          <Label>{t('TransactionModal.totalCost')}</Label>
          <VStack>
            <StrongText>{formattedAverage}</StrongText>
            <p className="text-sm text-right text-ui-500">{totalCost}</p>
          </VStack>
        </GasTotalCostEthContainer>
      </GasCostTableContainer>
      <ButtonContainer>
        <ButtonText
          className="mt-3 w-full"
          label={label[state]}
          iconLeft={icons[state]}
          isActive={state === TransactionState.LOADING}
          onClick={callback}
        />
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
      </ButtonContainer>
    </ModalBottomSheetSwitcher>
  );
};

export default PublishModal;

const GasCostTableContainer = styled.div.attrs({
  className: 'm-3 bg-white rounded-xl border border-ui-100 divide-y',
})``;

const GasCostEthContainer = styled.div.attrs({
  className: 'flex justify-between py-1.5 px-2',
})``;

const GasTotalCostEthContainer = styled.div.attrs({
  className: 'flex justify-between py-1.5 px-2 rounded-b-xl bg-ui-100',
})``;

const AlertInlineContainer = styled.div.attrs({
  className: 'mx-auto mt-2 w-max',
})``;

const ButtonContainer = styled.div.attrs({
  className: 'px-3 pb-3 rounded-b-xl',
})``;

const VStack = styled.div.attrs({
  className: 'space-y-0.25',
})``;

const StrongText = styled.p.attrs({
  className: 'font-bold text-right text-ui-600',
})``;

const Label = styled.p.attrs({
  className: 'text-ui-600',
})``;
