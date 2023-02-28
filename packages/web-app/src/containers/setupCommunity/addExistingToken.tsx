import {
  AlertInline,
  Label,
  Link,
  SearchInput,
  TextInput,
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
        <Title>{t('labels.addExistingToken')}</Title>
        <Subtitle>
          {t('createDAO.step3.addExistingTokenHelptext')}
          <Link label={t('createDAO.step3.tokenHelptextLink')} href="" />.
        </Subtitle>
      </DescriptionContainer>
      <FormItem>
        <DescriptionContainer>
          <Label label={t('labels.address')} />
          <p>
            <span>{t('createDAO.step3.tokenContractSubtitlePart1')}</span>
            <Link label="block explorer" href={explorer} />
            {'. '}
            <span>{t('createDAO.step3.tokenContractSubtitlePart2')}</span>
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
              <SearchInput
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
        {tokenName && tokenAddress && (
          <TokenInfoContainer>
            <InfoContainer>
              <Label label={t('labels.tokenName')} />
              <TextInput disabled value={tokenName || ''} />
            </InfoContainer>
            <InfoContainer>
              <Label label={t('labels.tokenSymbol')} />
              <TextInput disabled value={tokenSymbol || ''} />
            </InfoContainer>
            <InfoContainer>
              <Label label={t('labels.supply')} />
              <TextInput
                disabled
                defaultValue=""
                value={new Intl.NumberFormat('en-US', {
                  maximumFractionDigits: 4,
                }).format(tokenTotalSupply)}
              />
            </InfoContainer>
          </TokenInfoContainer>
        )}
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

const TokenInfoContainer = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-row tablet:gap-x-2 gap-y-2 tablet:justify-between tablet:items-center p-2 bg-ui-0 rounded-xl',
})``;

const InfoContainer = styled.div.attrs({
  className: 'space-y-1',
})``;
