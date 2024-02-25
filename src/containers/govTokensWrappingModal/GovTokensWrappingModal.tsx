import React, {useCallback, useMemo, FC} from 'react';

import {CheckboxListItem, Label, ValueInput} from '@aragon/ods-old';
import {Button, AlertInline, IconType, Spinner, Progress} from '@aragon/ods';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {validateTokenAmount} from 'utils/validators';
import {
  Controller,
  UseFormReturn,
  useFormState,
  useWatch,
} from 'react-hook-form';
import {StateEmpty} from 'components/stateEmpty';
import {Erc20TokenDetails} from '@aragon/sdk-client';
import numeral from 'numeral';
import {TokensWrappingFormData} from 'utils/types';
import {useGlobalModalContext} from 'context/globalModals';
import {featureFlags} from 'utils/featureFlags';

interface GovTokensWrappingModalProps {
  isOpen: boolean;
  onClose: (redirectPage?: boolean) => void;
  isLoading: boolean;
  daoToken: Erc20TokenDetails | undefined;
  wrappedDaoToken: Erc20TokenDetails | undefined;
  balances: {
    wrapped: string;
    unwrapped: string;
  };
  form: UseFormReturn<TokensWrappingFormData, object>;
  isFinished: boolean;
  currentStep: number;
  isTxLoading: boolean;
  isTxError: boolean;
  handleApprove: () => void;
  handleWrap: () => void;
  handleAddWrappedTokenToWallet: () => void;
  handleUnwrap: () => void;
}

const GovTokensWrappingModal: FC<GovTokensWrappingModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  daoToken,
  wrappedDaoToken,
  balances,
  form,
  isFinished,
  currentStep,
  isTxLoading,
  isTxError,
  handleApprove,
  handleWrap,
  handleAddWrappedTokenToWallet,
  handleUnwrap,
}) => {
  const {t} = useTranslation();
  const {isValid, dirtyFields} = useFormState({control: form.control});
  const {open} = useGlobalModalContext();

  const [mode, amount] = useWatch({
    name: ['mode', 'amount'],
    control: form.control,
  });
  const isWrapMode = mode === 'wrap';
  const enableDelegation =
    featureFlags.getValue('VITE_FEATURE_FLAG_DELEGATION') === 'true';

  const isTokenApproveLoading = isTxLoading && currentStep === 1 && isWrapMode;
  const isTokenWrapLoading = isTxLoading && currentStep === 2 && isWrapMode;
  const isTokenUnwrapLoading = isTxLoading && currentStep === 1 && !isWrapMode;

  const isTokenApproveError = isTxError && currentStep === 1 && isWrapMode;
  const isTokenWrapError = isTxError && currentStep === 2 && isWrapMode;
  const isTokenUnwrapError = isTxError && currentStep === 1 && !isWrapMode;

  const isUserInputDisabled =
    isTokenApproveLoading || isTokenWrapLoading || isTokenUnwrapLoading;
  const isUserInputValid = dirtyFields['amount'] && isValid;

  const modeData = useMemo(() => {
    const targetToken = isWrapMode ? daoToken : wrappedDaoToken;
    const tokenBalance = isWrapMode ? balances.unwrapped : balances.wrapped;
    const tokenSymbol = targetToken?.symbol || 'ANT';

    let title = t('modal.wrapToken.label');
    let subtitle = t('modal.wrapToken.desc', {
      tokenSymbol: daoToken?.symbol || 'ANT',
      gTokenSymbol: wrappedDaoToken?.symbol || 'ANT',
    });

    const finishedTitle = isWrapMode
      ? t('modal.wrapToken.successTitle')
      : t('modal.unwrapToken.successTitle');
    const finishedDescription = isWrapMode
      ? t('modal.wrapToken.successDesc', {
          amount,
          gTokenSymbol: wrappedDaoToken?.symbol,
        })
      : t('modal.unwrapToken.successDesc', {
          amount,
          tokenSymbol: daoToken?.symbol,
        });

    if (isFinished) {
      title = '';
      subtitle = '';
    }

    const wrapSteps = [
      {
        title: t('modal.wrapToken.footerTitle'),
        helpText: t('modal.wrapToken.footerDesc', {tokenSymbol}),
      },
      {
        title: t('modal.wrapToken.footerTitle'),
        helpText: t('modal.wrapToken.footerDesc', {tokenSymbol}),
      },
    ];

    const userBalanceDisplay = isWrapMode
      ? t('modal.wrapToken.inputAmountBalance', {
          amount: numeral(balances.unwrapped).format('0,0.[000000]'),
          tokenSymbol: daoToken?.symbol,
        })
      : t('modal.wrapToken.inputAmountBalanceWrapped', {
          amount: numeral(balances.wrapped).format('0,0.[000000]'),
          tokenSymbol: daoToken?.symbol,
        });

    return {
      targetToken,
      tokenBalance,
      title,
      subtitle,
      steps: isWrapMode ? wrapSteps : [],
      finishedTitle,
      finishedDescription,
      userBalanceDisplay,
    };
  }, [
    amount,
    balances.unwrapped,
    balances.wrapped,
    daoToken,
    isFinished,
    isWrapMode,
    t,
    wrappedDaoToken,
  ]);

  /* Token amount field handling */
  const amountValidator = useCallback(
    async (tokenAmount: string) => {
      if (!modeData.targetToken) return '';
      return validateTokenAmount(
        tokenAmount,
        modeData.targetToken.decimals,
        modeData.tokenBalance
      );
    },
    [modeData.targetToken, modeData.tokenBalance]
  );

  const handleMaxClicked = useCallback(
    (onChange: (value: string) => void) => {
      if (modeData.tokenBalance) {
        onChange(modeData.tokenBalance);
      }
    },
    [modeData.tokenBalance]
  );

  const handleDelegateClick = () => {
    onClose(false);
    open('delegateVoting');
  };

  return (
    <ModalBottomSheetSwitcher
      isOpen={isOpen}
      onClose={onClose}
      title={modeData.title}
      subtitle={modeData.subtitle}
    >
      {isLoading ? (
        <Container>
          <LoadingContainer>
            <Spinner size="xl" variant="primary" />
            <LoadingLabel>{t('labels.loading')}</LoadingLabel>
          </LoadingContainer>
        </Container>
      ) : isFinished ? (
        <StateEmpty
          customCardPaddingClassName="p-6"
          type="Human"
          mode="card"
          body="elevating"
          expression="smile_wink"
          sunglass="big_rounded"
          hair="middle"
          accessory="buddha"
          title={modeData.finishedTitle}
          description={modeData.finishedDescription}
          actionsColumn={isWrapMode}
          primaryButton={{
            label: isWrapMode
              ? t('modal.wrapToken.successCtaLabel')
              : t('modal.unwrapToken.successCtaLabel'),
            className: 'w-full',
            onClick: () => onClose(),
          }}
          secondaryButton={
            isWrapMode
              ? {
                  label: t('modal.wrapToken.successBtnSecondaryLabel'),
                  className: 'w-full',
                  onClick: handleAddWrappedTokenToWallet,
                }
              : undefined
          }
          tertiaryButton={
            isWrapMode && enableDelegation
              ? {
                  label: t('modal.wrapToken.successBtnGhostLabel'),
                  className: 'w-full',
                  onClick: handleDelegateClick,
                }
              : undefined
          }
        />
      ) : (
        <Container>
          <BodyWrapper>
            <form className="space-y-4">
              {/* Action selection */}
              <FormItem>
                <Label label={t('modal.wrapToken.inputModeLabel')} />
                <Controller
                  name="mode"
                  control={form.control}
                  defaultValue="wrap"
                  render={({field: {onChange, value}}) => (
                    <ModeActionSelection>
                      <div className="flex-1">
                        <CheckboxListItem
                          type={value === 'wrap' ? 'active' : 'default'}
                          disabled={isUserInputDisabled}
                          label={t('modal.wrapToken.inputSelectWrap')}
                          multiSelect={false}
                          onClick={() => onChange('wrap')}
                        />
                      </div>
                      <div className="flex-1">
                        <CheckboxListItem
                          type={value === 'unwrap' ? 'active' : 'default'}
                          disabled={isUserInputDisabled}
                          label={t('modal.wrapToken.inputSelectUnwrap')}
                          multiSelect={false}
                          onClick={() => onChange('unwrap')}
                        />
                      </div>
                    </ModeActionSelection>
                  )}
                />
              </FormItem>

              {/* Token amount */}
              <FormItem>
                <Label label={t('modal.wrapToken.inputAmountLabel')} />
                <Controller
                  name={'amount'}
                  control={form.control}
                  defaultValue=""
                  rules={{
                    required: t('errors.required.amount'),
                    validate: amountValidator,
                  }}
                  render={({
                    field: {name, onBlur, onChange, value},
                    fieldState: {error},
                  }) => (
                    <>
                      <TokenAmountInput
                        mode={error ? 'critical' : 'default'}
                        name={name}
                        disabled={isUserInputDisabled}
                        type="number"
                        value={value}
                        placeholder="0"
                        onBlur={onBlur}
                        onChange={onChange}
                        adornmentText={t('labels.max')}
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        onAdornmentClick={(e: Event) => {
                          // Needed to prevent page reload when MAX clicked.
                          e?.preventDefault?.();
                          e?.stopPropagation?.();
                          handleMaxClicked(onChange);
                        }}
                      />
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          {error?.message && (
                            <AlertInline
                              message={error.message}
                              variant="critical"
                            />
                          )}
                        </div>
                        {modeData.tokenBalance && (
                          <TokenBalance>
                            {modeData.userBalanceDisplay}
                          </TokenBalance>
                        )}
                      </div>
                    </>
                  )}
                />
              </FormItem>
            </form>

            {/* Progress Bar */}
            {!!modeData.steps.length && (
              <ProgressContainer>
                <ProgressHeader>
                  <ProgressTitle>
                    {modeData.steps[currentStep - 1].title}
                  </ProgressTitle>
                  <ProgressSteps>
                    {t('modal.wrapToken.footerSteps', {
                      step: currentStep,
                      steps: modeData.steps.length,
                    })}
                  </ProgressSteps>
                </ProgressHeader>
                <Progress
                  value={
                    modeData.steps.length !== 0
                      ? (currentStep - 1 / modeData.steps.length) * 100
                      : 0
                  }
                />
                <ProgressHelpText>
                  {modeData.steps[currentStep - 1].helpText}
                </ProgressHelpText>
              </ProgressContainer>
            )}

            {/* User button actions */}
            <ActionsContainer>
              {isWrapMode ? (
                <>
                  <Button
                    variant="primary"
                    disabled={!isUserInputValid || currentStep !== 1}
                    isLoading={isTokenApproveLoading}
                    iconLeft={
                      isTokenApproveLoading
                        ? undefined
                        : isTokenApproveError
                        ? IconType.RELOAD
                        : undefined
                    }
                    size="lg"
                    className="w-full"
                    onClick={handleApprove}
                  >
                    {isTokenApproveError
                      ? t('modal.wrapToken.footerCtaError')
                      : t('modal.wrapToken.footerCtaFirst')}
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!isUserInputValid || currentStep !== 2}
                    isLoading={isTokenWrapLoading}
                    iconLeft={
                      isTokenWrapLoading
                        ? undefined
                        : isTokenWrapError
                        ? IconType.RELOAD
                        : undefined
                    }
                    size="lg"
                    className="w-full"
                    onClick={handleWrap}
                  >
                    {isTokenWrapError
                      ? t('modal.wrapToken.footerCtaError')
                      : t('modal.wrapToken.footerCtaSecond')}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="primary"
                    disabled={!isUserInputValid}
                    isLoading={isTokenUnwrapLoading}
                    iconLeft={
                      isTokenUnwrapLoading
                        ? undefined
                        : isTokenUnwrapError
                        ? IconType.RELOAD
                        : undefined
                    }
                    size="lg"
                    className="w-full"
                    onClick={handleUnwrap}
                  >
                    {isTokenUnwrapError
                      ? t('modal.wrapToken.footerCtaError')
                      : t('modal.wrapToken.footerWrappedCtaLabel')}
                  </Button>
                  <Button
                    variant="tertiary"
                    size="lg"
                    className="w-full"
                    onClick={() => onClose()}
                  >
                    {t('modal.wrapToken.footerWrappedCancelLabel')}
                  </Button>
                </>
              )}
            </ActionsContainer>

            {isTxError && (
              <div className="flex justify-center text-center">
                <AlertInline
                  message={
                    isTokenApproveError
                      ? t('modal.wrapToken.footerAlertCriticalApprove')
                      : isTokenWrapError
                      ? t('modal.wrapToken.footerAlertCriticalWrap')
                      : isTokenUnwrapError
                      ? t('TransactionModal.errorLabel')
                      : ''
                  }
                  variant="critical"
                />
              </div>
            )}
          </BodyWrapper>
        </Container>
      )}
    </ModalBottomSheetSwitcher>
  );
};

const Container = styled.div.attrs({
  className: 'p-6',
})``;

const BodyWrapper = styled.div.attrs({
  className: 'space-y-4',
})``;

const LoadingContainer = styled.div.attrs({
  className: 'flex flex-col col-span-full gap-6 items-center py-12 w-full',
})``;

const LoadingLabel = styled.span.attrs({
  className: 'text-xl leading-normal text-center',
})``;

const FormItem = styled.div.attrs({
  className: 'space-y-3',
})``;

const ModeActionSelection = styled.div.attrs({
  className: 'flex gap-6 items-center',
})``;

const TokenBalance = styled.p.attrs({
  className: 'flex-1 px-2 text-xs leading-normal text-right text-neutral-600',
})``;

const TokenAmountInput = styled(ValueInput)`
  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;

const ProgressContainer = styled.div.attrs({
  className: 'flex flex-col gap-2',
})``;

const ProgressHeader = styled.div.attrs({
  className: 'flex justify-between items-center ft-text-sm',
})``;

const ProgressTitle = styled.div.attrs({
  className: 'font-semibold text-primary-500',
})``;

const ProgressSteps = styled.div.attrs({
  className: 'text-neutral-400',
})``;

const ProgressHelpText = styled.div.attrs({
  className: 'ft-text-sm text-neutral-600',
})``;

const ActionsContainer = styled.div.attrs({
  className: 'flex gap-4 items-center',
})``;

export default GovTokensWrappingModal;
