import {
  ButtonText,
  CardText,
  CardToken,
  CardTransfer,
  IconChevronLeft,
  IconChevronRight,
} from '@aragon/ui-components';
import React, {useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {useProviders} from 'context/providers';
import {fetchTokenPrice} from 'services/prices';
import {useNetwork} from 'context/network';
import {useFormStep} from 'components/fullScreenStepper';
import {useDepositDao} from 'context/deposit';
import styled from 'styled-components';
import {abbreviateTokenAmount} from 'utils/tokens';
import {trackEvent} from 'services/analytics';
import {useParams} from 'react-router-dom';

const ReviewDeposit: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {infura: provider} = useProviders();

  const [price, setPrice] = useState<string>();
  const {getValues, setValue} = useFormContext();
  const values = getValues();

  useEffect(() => {
    async function getPrice() {
      const tokenPrice = await fetchTokenPrice(values.tokenAddress, network);
      if (tokenPrice) {
        setPrice(
          new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(tokenPrice * values.amount)
        );
      }
    }

    getPrice();
  }, [
    network,
    provider,
    setValue,
    values.amount,
    values.isCustomToken,
    values.tokenAddress,
  ]);

  return (
    <div className="space-y-1.5 desktop:space-y-3">
      <CardTransfer
        to={values?.daoName}
        from={values.from}
        toLabel={t('labels.to')}
        fromLabel={t('labels.from')}
      />
      <CardToken
        type="transfer"
        tokenName={values.tokenName}
        tokenCount={abbreviateTokenAmount(values.amount.toString())}
        tokenSymbol={values.tokenSymbol}
        tokenImageUrl={values.tokenImgUrl}
        treasuryShare={price}
      />
      {values.reference && (
        <CardText
          type="label"
          title={t('labels.reference')}
          content={values.reference}
        />
      )}
    </div>
  );
};

export default ReviewDeposit;

export const CustomFooter = () => {
  const {prev} = useFormStep();
  const {t} = useTranslation();
  const {handleOpenModal} = useDepositDao();
  const {dao} = useParams();
  const {getValues} = useFormContext();

  return (
    <FormFooter>
      <ButtonText
        mode="secondary"
        size="large"
        label={t('labels.back')}
        onClick={() => prev()}
        iconLeft={<IconChevronLeft />}
      />
      <ButtonText
        label={t('labels.submitDeposit')}
        size="large"
        onClick={() => {
          trackEvent('newDeposit_SubmitDeposit_clicked', {
            dao_address: dao,
            token_address: getValues('tokenAddress'),
            amount: getValues('amount'),
            reference: getValues('reference'),
          });
          handleOpenModal();
        }}
        iconRight={<IconChevronRight />}
      />
    </FormFooter>
  );
};

const FormFooter = styled.div.attrs({
  className: 'flex justify-between desktop:pt-3',
})``;
