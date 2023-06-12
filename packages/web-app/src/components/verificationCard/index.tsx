import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {AlertCard, Label, Spinner, shortenAddress} from '@aragon/ui-components';

import {Dd, Dl} from 'components/descriptionList';
import {useFormContext, useWatch} from 'react-hook-form';
import {SelectEligibility} from 'components/selectEligibility';

type TransferListProps = {
  tokenAddress: string;
};

const VerificationCard: React.FC<TransferListProps> = ({tokenAddress}) => {
  const {t} = useTranslation();
  const {control} = useFormContext();
  const [tokenName, tokenSymbol, tokenTotalSupply, tokenType] = useWatch({
    name: ['tokenName', 'tokenSymbol', 'tokenTotalSupply', 'tokenType'],
    control: control,
  });

  const Alert = useMemo(() => {
    switch (tokenType) {
      case 'ERC-20':
        return (
          <AlertCard
            mode="warning"
            title={t(
              'createDAO.step3.existingToken.verificationAlertWarningTitle'
            )}
            helpText={t(
              'createDAO.step3.existingToken.verificationAlertWarningDescription'
            )}
          />
        );
      case 'governance-ERC20':
        return (
          <AlertCard
            mode="success"
            title={t(
              'createDAO.step3.existingToken.verificationAlertSuccessTitle'
            )}
            helpText={t(
              'createDAO.step3.existingToken.verificationAlertSuccessDescription'
            )}
          />
        );
      case 'ERC-1155':
      case 'ERC-721':
        return (
          <AlertCard
            mode="critical"
            title={t(
              'createDAO.step3.existingToken.verificationAlertCriticalTitle'
            )}
            helpText={t(
              'createDAO.step3.existingToken.verificationAlertCriticalDescription'
            )}
          />
        );
      case 'Unknown':
        return (
          <AlertCard
            mode="critical"
            title={t(
              'createDAO.step3.existingToken.verificationAlertCriticalTitle'
            )}
            helpText={t(
              'createDAO.step3.existingToken.verificationAlertCriticalDescription'
            )}
          />
        );
      default:
        return null;
    }
  }, [t, tokenType]);

  if (!tokenType)
    return (
      <VerifyContainer>
        <VerifyTitle>{shortenAddress(tokenAddress)}</VerifyTitle>
        <LoadingWrapper>
          <Spinner size={'xs'} />
          {t('createDAO.step3.existingToken.verificationLoading')}
        </LoadingWrapper>
      </VerifyContainer>
    );

  return (
    <VerifyWrapper>
      <VerifyContainer>
        <VerifyTitle>
          {tokenName !== ''
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
                  {tokenTotalSupply} {tokenSymbol}
                </Dd>
              </Dl>
              <Dl>
                <Dt>
                  {t('createDAO.step3.existingToken.verificationLabelHolders')}
                </Dt>
                <Dd>14,579</Dd>
              </Dl>
            </>
          )}
          <Dl>
            <Dt>
              {t('createDAO.step3.existingToken.verificationLabelGovernance')}
            </Dt>
            <Dd>
              {tokenType === 'governance-ERC20'
                ? t(
                    'createDAO.step3.existingToken.verificationValueGovernancePositive'
                  )
                : t(
                    'createDAO.step3.existingToken.verificationValueGovernanceNegative'
                  )}
            </Dd>
          </Dl>
        </VerifyItemsWrapper>
        {Alert}
      </VerifyContainer>
      <div>
        <Label
          label={t('labels.proposalCreation')}
          helpText={t('createDAO.step3.proposalCreationHelpertext')}
        />
        <SelectEligibility />
      </div>
    </VerifyWrapper>
  );
};

export default VerificationCard;

const VerifyContainer = styled.div.attrs({
  className: 'flex flex-col space-y-3 p-3 bg-ui-0 rounded-xl',
})``;

const VerifyWrapper = styled.div.attrs({
  className: 'space-y-3',
})``;

const LoadingWrapper = styled.div.attrs({
  className: 'flex py-3 text-primary-400 gap-x-1 items-center',
})``;

const VerifyTitle = styled.h2.attrs({
  className: 'ft-text-lg font-bold text-800',
})``;

const VerifyItemsWrapper = styled.div.attrs({
  className: 'flex flex-col tablet:gap-x-2 gap-y-1.5',
})``;

const Dt = styled.dt.attrs({
  className: 'flex items-center text-ui-800',
})``;
