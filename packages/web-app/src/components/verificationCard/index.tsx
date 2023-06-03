import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {AlertCard, Spinner, shortenAddress} from '@aragon/ui-components';

import {tokenType} from 'utils/validators';
import {Dd, Dl} from 'components/descriptionList';
import {tokenParams} from 'containers/setupCommunity/addExistingToken';

type TransferListProps = {
  tokenParams: tokenParams;
  tokenAddress: string;
};

const VerificationCard: React.FC<TransferListProps> = ({
  tokenParams,
  tokenAddress,
}) => {
  const {t} = useTranslation();

  const Alert = useMemo(() => {
    switch (tokenParams.type) {
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
      default:
        return null;
    }
  }, [t, tokenParams.type]);

  if (tokenParams.status === null) return null;

  if (tokenParams.status === 'loading')
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
    <VerifyContainer>
      <VerifyTitle>
        {tokenParams.name
          ? `${tokenParams.name} (${tokenParams.symbol})`
          : shortenAddress(tokenAddress)}
      </VerifyTitle>
      <VerifyItemsWrapper>
        <Dl>
          <Dt>
            {t('createDAO.step3.existingToken.verificationLabelStandard')}
          </Dt>
          <Dd>{tokenParams.type}</Dd>
        </Dl>
        <Dl>
          <Dt>{t('createDAO.step3.existingToken.verificationLabelSupply')}</Dt>
          <Dd>
            {tokenParams.totalSupply} {tokenParams.symbol}
          </Dd>
        </Dl>
        <Dl>
          <Dt>{t('createDAO.step3.existingToken.verificationLabelHolders')}</Dt>
          <Dd>14,579</Dd>
        </Dl>
        <Dl>
          <Dt>
            {t('createDAO.step3.existingToken.verificationLabelGovernance')}
          </Dt>
          <Dd>{tokenParams.status}</Dd>
        </Dl>
      </VerifyItemsWrapper>
      {Alert}
    </VerifyContainer>
  );
};

export default VerificationCard;

const VerifyContainer = styled.div.attrs({
  className: 'flex flex-col space-y-3 p-3 bg-ui-0 rounded-xl',
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
