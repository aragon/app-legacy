import React, {useMemo, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {shortenAddress} from '@aragon/ods-old';
import {AlertCard, Spinner} from '@aragon/ods';

import {Dd, Dl} from 'components/descriptionList';
import {useFormContext, useWatch} from 'react-hook-form';
import {gTokenSymbol} from 'utils/tokens';
import {useNetwork} from 'context/network';
import numeral from 'numeral';
import {useTokenHolders} from 'services/aragon-backend/queries/use-token-holders';

type TransferListProps = {
  tokenAddress: string;
};

const VerificationCard: React.FC<TransferListProps> = ({tokenAddress}) => {
  const {t} = useTranslation();
  const {control, setValue, resetField} = useFormContext();
  const [
    tokenName,
    tokenSymbol,
    tokenTotalSupply,
    tokenTotalHolders,
    tokenType,
    votingType,
  ] = useWatch({
    name: [
      'tokenName',
      'tokenSymbol',
      'tokenTotalSupply',
      'tokenTotalHolders',
      'tokenType',
      'votingType',
    ],
    control: control,
  });
  const {network} = useNetwork();

  const {data: tokenHolders, isLoading: isTotalHoldersLoading} =
    useTokenHolders({tokenAddress, network});

  useEffect(() => {
    if (tokenHolders) {
      resetField('tokenTotalHolders');
      setValue('tokenTotalHolders', tokenHolders.holders.totalHolders);
    }
  }, [resetField, setValue, tokenHolders]);

  useEffect(() => {
    if (tokenType === 'governance-ERC20') setValue('eligibilityTokenAmount', 1);
  }, [tokenType, setValue]);

  const Alert = useMemo(() => {
    switch (tokenType) {
      case 'ERC-20':
        if (votingType === 'gasless') {
          return (
            <AlertCard
              mode="success"
              title={t(
                'createDAO.step3.existingToken.verificationAlertSuccessTitle'
              )}
              helpText={
                'DEV The ERC20 token selected is compatible for voting on the Vocdoni system'
              }
            />
          );
        }
        return (
          <AlertCard
            variant="warning"
            message={t(
              'createDAO.step3.existingToken.verificationAlertWarningTitle'
            )}
            description={t(
              'createDAO.step3.existingToken.verificationAlertWarningDescription',
              {
                tokenSymbol,
                gTokenSymbol: gTokenSymbol(tokenSymbol),
              }
            )}
          />
        );
      case 'governance-ERC20':
        return (
          <AlertCard
            variant="success"
            message={t(
              'createDAO.step3.existingToken.verificationAlertSuccessTitle'
            )}
            description={t(
              'createDAO.step3.existingToken.verificationAlertSuccessDescription'
            )}
          />
        );
      case 'ERC-1155':
      case 'ERC-721':
        return (
          <AlertCard
            variant="critical"
            message={t(
              'createDAO.step3.existingToken.verificationAlertCriticalTitle'
            )}
            description={t(
              'createDAO.step3.existingToken.verificationAlertCriticalDescription'
            )}
          />
        );
      case 'Unknown':
        return (
          <AlertCard
            variant="critical"
            message={t(
              'createDAO.step3.existingToken.verificationAlertCriticalTitle'
            )}
            description={t(
              'createDAO.step3.existingToken.verificationAlertCriticalDescription'
            )}
          />
        );
      default:
        return null;
    }
  }, [t, tokenSymbol, tokenType, votingType]);

  const formattedTokenTotalSupply = useMemo(() => {
    if (tokenTotalSupply < 100) {
      return numeral(tokenTotalSupply).format('0,0.[000]');
    }

    // More than 100 trillion (otherwise formatting fails on bigger numbers)
    if (tokenTotalSupply > 1e14) {
      return '> 100t';
    }

    const totalSupplyString = tokenTotalSupply.toLocaleString('fullwide', {
      useGrouping: false,
    });

    return numeral(totalSupplyString).format('0.[00]a');
  }, [tokenTotalSupply]);

  const formattedTokenTotalHolders = useMemo(() => {
    if (!tokenTotalHolders) return '-';

    // More than 100 trillion (otherwise formatting fails on bigger numbers)
    if (tokenTotalHolders > 1e14) {
      return '> 100t';
    }

    const tokenTotalHoldersString = tokenTotalHolders.toLocaleString(
      'fullwide',
      {
        useGrouping: false,
      }
    );

    return numeral(tokenTotalHoldersString).format('0.[00]a');
  }, [tokenTotalHolders]);

  if (!tokenType)
    return (
      <VerifyContainer>
        <VerifyTitle>{shortenAddress(tokenAddress)}</VerifyTitle>
        <LoadingWrapper>
          <Spinner size="sm" variant="primary" />
          {t('createDAO.step3.existingToken.verificationLoading')}
        </LoadingWrapper>
      </VerifyContainer>
    );

  return (
    <VerifyWrapper>
      <VerifyContainer>
        <VerifyTitle>
          {tokenName !== '' && tokenType !== 'Unknown'
            ? `${tokenName} (${tokenSymbol})`
            : shortenAddress(tokenAddress)}
        </VerifyTitle>
        <VerifyItemsWrapper>
          <Dl>
            <Dt>
              {t('createDAO.step3.existingToken.verificationLabelStandard')}
            </Dt>
            <Dd>{tokenType === 'governance-ERC20' ? 'ERC-20' : tokenType}</Dd>
          </Dl>
          {tokenType !== 'Unknown' && (
            <>
              <Dl>
                <Dt>
                  {t('createDAO.step3.existingToken.verificationLabelSupply')}
                </Dt>
                <Dd>
                  {formattedTokenTotalSupply} {tokenSymbol}
                </Dd>
              </Dl>
              <Dl>
                <Dt>
                  {t('createDAO.step3.existingToken.verificationLabelHolders')}
                </Dt>
                {isTotalHoldersLoading ? (
                  <dd className="flex items-center" style={{width: '70%'}}>
                    <Spinner size="sm" variant="primary" />
                  </dd>
                ) : (
                  <Dd>{formattedTokenTotalHolders}</Dd>
                )}
              </Dl>
            </>
          )}
        </VerifyItemsWrapper>
        {Alert}
      </VerifyContainer>
    </VerifyWrapper>
  );
};

export default VerificationCard;

const VerifyContainer = styled.div.attrs({
  className: 'flex flex-col space-y-6 p-6 bg-neutral-0 rounded-xl',
})``;

const VerifyWrapper = styled.div.attrs({
  className: 'space-y-12',
})``;

const LoadingWrapper = styled.div.attrs({
  className: 'flex py-6 text-primary-400 gap-x-2 items-center',
})``;

const VerifyTitle = styled.h2.attrs({
  className: 'ft-text-lg font-semibold text-800',
})``;

const VerifyItemsWrapper = styled.div.attrs({
  className: 'flex flex-col md:gap-x-4 gap-y-3',
})``;

const Dt = styled.dt.attrs({
  className: 'flex items-center text-neutral-800',
})``;
