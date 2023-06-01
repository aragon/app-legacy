import {
  AlertInline,
  Label,
  Link,
  WalletInput,
  AlertCard,
  InputValue,
} from '@aragon/ui-components';
import React, {useCallback, useEffect, useState} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {useSpecificProvider} from 'context/providers';
import {formatUnits} from 'utils/library';
import {getTokenInfo} from 'utils/tokens';
import {
  validateGovernanceTokenAddress,
  tokenType,
  validateTokenType,
} from 'utils/validators';
import {useNetwork} from 'context/network';
import {CHAIN_METADATA, ENS_SUPPORTED_NETWORKS} from 'utils/constants';
import {Dd, Dl} from 'components/descriptionList';

const AddExistingToken: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {control, setValue, trigger} = useFormContext();

  const networkSupportsENS = ENS_SUPPORTED_NETWORKS.includes(network);

  // once the translation of the ui-components has been dealt with,
  // consider moving these inside the component itself.
  const [tokenType, setTokenType] = useState<tokenType>(undefined);

  const [tokenAddress, blockchain, tokenName, tokenSymbol, tokenTotalSupply] =
    useWatch({
      name: [
        'tokenAddress',
        'blockchain',
        'tokenName',
        'tokenSymbol',
        'tokenTotalSupply',
      ],
    });

  const provider = useSpecificProvider(blockchain.id);

  const handleValueChanged = useCallback(
    (value: InputValue, onChange: (...event: unknown[]) => void) =>
      onChange(value),
    []
  );

  const nativeCurrency = CHAIN_METADATA[network].nativeCurrency;

  // Trigger address validation on network change
  useEffect(() => {
    if (blockchain.id && tokenAddress !== '') {
      trigger('tokenAddress');
    }
  }, [blockchain.id, tokenAddress, trigger, nativeCurrency]);

  /*************************************************
   *            Functions and Callbacks            *
   *************************************************/
  const addressValidator = useCallback(
    async contractAddress => {
      const isErc20Valid = await validateGovernanceTokenAddress(
        contractAddress,
        provider,
        setTokenType
      );

      if (isErc20Valid !== true) {
        await validateTokenType(contractAddress, provider, setTokenType);
      }

      return isErc20Valid;
    },
    [provider]
  );

  console.log('tokenType-->', tokenType);

  return (
    <>
      <DescriptionContainer>
        <Title>{t('createDAO.step3.existingToken.title')}</Title>
        <Subtitle>
          {t('createDAO.step3.existingToken.description')}
          <Link
            label={t('createDAO.step3.existingToken.descriptionLinkLabel')}
            href=""
          />
          .
        </Subtitle>
      </DescriptionContainer>
      <FormItem>
        <DescriptionContainer>
          <Label label={t('createDAO.step3.existingToken.inputLabel')} />
          <p>
            <span>{t('createDAO.step3.existingToken.inputDescription')}</span>
          </p>
        </DescriptionContainer>
        <Controller
          name="existingContractAddress"
          control={control}
          defaultValue=""
          rules={{
            required: t('errors.required.tokenAddress'),
            validate: addressValidator,
          }}
          render={({
            field: {name, value, onBlur, onChange},
            fieldState: {error, isDirty, invalid},
          }) => (
            <>
              <WalletInput
                name={name}
                state={error && 'critical'}
                value={value}
                onBlur={onBlur}
                placeholder={networkSupportsENS ? 'ENS or 0x…' : '0x…'}
                onValueChange={value => handleValueChanged(value, onChange)}
                blockExplorerURL={CHAIN_METADATA[network].lookupURL}
              />
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </>
          )}
        />
        <VerifyContainer>
          <VerifyTitle>Aragon Network Token (ANT)</VerifyTitle>
          <VerifyItemsWrapper>
            <Dl>
              <Dt>
                {t('createDAO.step3.existingToken.verificationLabelStandard')}
              </Dt>
              <Dd>ERC-20</Dd>
            </Dl>
            <Dl>
              <Dt>
                {t('createDAO.step3.existingToken.verificationLabelSupply')}
              </Dt>
              <Dd>43,166,685 ANT</Dd>
            </Dl>
            <Dl>
              <Dt>
                {t('createDAO.step3.existingToken.verificationLabelHolders')}
              </Dt>
              <Dd>14,579</Dd>
            </Dl>
            <Dl>
              <Dt>
                {t('createDAO.step3.existingToken.verificationLabelGovernance')}
              </Dt>
              <Dd>Supported</Dd>
            </Dl>
          </VerifyItemsWrapper>
          <AlertCard
            mode="success"
            title={t(
              'createDAO.step3.existingToken.verificationAlertSuccessTitle'
            )}
            helpText={t(
              'createDAO.step3.existingToken.verificationAlertSuccessDescription'
            )}
          />
        </VerifyContainer>
      </FormItem>
    </>
  );
};

export default AddExistingToken;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const DescriptionContainer = styled.div.attrs({
  className: 'space-y-0.5',
})``;

const Title = styled.p.attrs({className: 'text-lg font-bold text-ui-800'})``;

const Subtitle = styled.p.attrs({className: 'text-ui-600 text-bold'})``;

const VerifyContainer = styled.div.attrs({
  className: 'flex flex-col space-y-3 p-3 bg-ui-0 rounded-xl',
})``;

const VerifyTitle = styled.h2.attrs({
  className: 'ft-text-lg font-bold text-ui-800',
})``;

const VerifyItemsWrapper = styled.div.attrs({
  className: 'flex flex-col tablet:gap-x-2 gap-y-1.5',
})``;

const Dt = styled.dt.attrs({
  className: 'flex items-center text-ui-800',
})``;
