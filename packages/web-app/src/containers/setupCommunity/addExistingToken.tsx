import {
  AlertInline,
  Label,
  Link,
  WalletInput,
  AlertCard,
} from '@aragon/ui-components';
import React, {useCallback, useEffect, useMemo} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {useSpecificProvider} from 'context/providers';
import {formatUnits} from 'utils/library';
import {getTokenInfo} from 'utils/tokens';
import {validateTokenAddress} from 'utils/validators';
import {useNetwork} from 'context/network';
import {CHAIN_METADATA, getSupportedNetworkByChainId} from 'utils/constants';
import {Dd, Dl, Dt} from 'components/descriptionList';

const DEFAULT_BLOCK_EXPLORER = 'https://etherscan.io/';

const AddExistingToken: React.FC = () => {
  const {t} = useTranslation();
  const {control, setValue, trigger} = useFormContext();

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
  const explorer = useMemo(() => {
    if (blockchain.id) {
      const defaultNetwork =
        getSupportedNetworkByChainId(blockchain.id) || 'ethereum';
      const explorerUrl = CHAIN_METADATA[defaultNetwork].explorer;
      return explorerUrl || DEFAULT_BLOCK_EXPLORER;
    }

    return DEFAULT_BLOCK_EXPLORER;
  }, [blockchain.id]);

  const {network} = useNetwork();
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
      const isValid = await validateTokenAddress(contractAddress, provider);

      if (isValid) {
        try {
          const res = await getTokenInfo(
            contractAddress,
            provider,
            nativeCurrency
          );

          setValue('tokenName', res.name);
          setValue('tokenSymbol', res.symbol);
          setValue(
            'tokenTotalSupply',
            formatUnits(res.totalSupply, res.decimals)
          );
        } catch (error) {
          console.error('Error fetching token information', error);
        }
      }

      return isValid;
    },
    [provider, setValue, nativeCurrency]
  );

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
          name="tokenAddress"
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
                {...{name, value, onBlur, onChange}}
                placeholder="0x..."
              />
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
              {!invalid && isDirty && tokenSymbol && (
                <AlertInline label={t('success.contract')} mode="success" />
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

const InfoContainer = styled.div.attrs({
  className: 'space-y-1',
})``;
