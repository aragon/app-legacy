import {AssetBalance} from '@aragon/sdk-client';
import {ButtonText, IconAdd, IconStorage, SearchInput} from '@aragon/ods-old';
import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useGlobalModalContext} from 'context/globalModals';
import {constants} from 'ethers';
import {useTokenMetadata} from 'hooks/useTokenMetadata';
import {formatUnits} from 'utils/library';
import {abbreviateTokenAmount} from 'utils/tokens';
import {BaseTokenInfo, TokenWithMetadata} from 'utils/types';
import TokenBox from './tokenBox';

const customToken = {
  address: '',
  count: BigInt(0),
  decimals: 18,
  imgUrl: '',
  symbol: '',
  name: '',
};

type TokenMenuProps = {
  isWallet?: boolean;
  tokenBalances: AssetBalance[];
  onTokenSelect: (token: BaseTokenInfo) => void;
};

const TokenMenu: React.FC<TokenMenuProps> = ({
  isWallet = true,
  tokenBalances,
  onTokenSelect,
}) => {
  const {t} = useTranslation();
  const {data: tokens} = useTokenMetadata(tokenBalances);
  const {isOpen, close} = useGlobalModalContext('token');
  const [searchValue, setSearchValue] = useState('');

  /*************************************************
   *             Functions and Handlers            *
   *************************************************/
  const handleTokenClick = (token: TokenWithMetadata) => {
    onTokenSelect({
      id: token.metadata.apiId,
      address: token.metadata.id,
      name: token.metadata.name,
      count: token.balance,
      imgUrl: token.metadata.imgUrl,
      symbol: token.metadata.symbol,
      decimals: token.metadata.decimals,
    });
    close();
  };

  const filterValidator = useCallback(
    (token: TokenWithMetadata) => {
      if (searchValue !== '') {
        const re = new RegExp(searchValue, 'i');
        return (
          token?.metadata.name?.match(re) || token?.metadata.symbol?.match(re)
        );
      }
      return true;
    },
    [searchValue]
  );

  const sortTokens = (a: TokenWithMetadata, b: TokenWithMetadata) => {
    if (
      a.metadata.id === constants.AddressZero ||
      b.metadata.id === constants.AddressZero
    ) {
      return 1;
    } else {
      const aName = (a.metadata.name || '').toLowerCase();
      const bName = (b.metadata.name || '').toLowerCase();
      return aName.localeCompare(bName);
    }
  };

  const RenderTokens = () => {
    const tokenList = tokens.filter(filterValidator).sort(sortTokens);

    if (tokenList.length === 0 && searchValue === '') {
      return (
        <>
          <NoTokenContainer>
            <IconWrapper>
              <IconStorage height={24} width={24} />
            </IconWrapper>
            <TokenTitle>{t('TokenModal.tokenNotAvailable')}</TokenTitle>
            <TokenDescription>
              {isWallet
                ? t('TokenModal.tokenNotAvailableSubtitle')
                : t('TokenModal.tokenNotAvailableSubtitleDao')}
            </TokenDescription>
          </NoTokenContainer>
        </>
      );
    } else if (tokenList.length === 0) {
      return (
        <>
          <NoTokenWrapper>
            <TokenTitle>{t('TokenModal.tokenNotFoundTitle')}</TokenTitle>
            <TokenSubtitle>
              {isWallet
                ? t('TokenModal.tokenNotFoundSubtitle')
                : t('TokenModal.tokenNotFoundSubtitleDao')}
            </TokenSubtitle>
          </NoTokenWrapper>
        </>
      );
    } else {
      return (
        <>
          {tokenList.map(token => (
            <div
              key={token.metadata.id}
              onClick={() => handleTokenClick(token)}
            >
              <TokenBox
                tokenName={token.metadata.name}
                tokenLogo={token.metadata.imgUrl}
                tokenSymbol={token.metadata.symbol}
                tokenBalance={abbreviateTokenAmount(
                  formatUnits(token.balance, token.metadata.decimals)
                )}
              />
            </div>
          ))}
        </>
      );
    }
  };

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <ModalBottomSheetSwitcher
      isOpen={isOpen}
      onClose={close}
      data-testid="TokenMenu"
    >
      <Container>
        <SearchInput
          value={searchValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchValue(e.target.value)
          }
          placeholder={t('placeHolders.searchTokens')}
        />
        <TokensWrapper>
          <RenderTokens />
        </TokensWrapper>
        <WideButton
          mode="secondary"
          size="large"
          label="Add Custom Token"
          iconLeft={<IconAdd />}
          onClick={() => {
            onTokenSelect({...customToken, symbol: searchValue});
            close();
          }}
        />
      </Container>
    </ModalBottomSheetSwitcher>
  );
};

export default TokenMenu;

const Container = styled.div.attrs({
  className: 'space-y-6 p-6',
})``;

const TokensWrapper = styled.div.attrs({
  className: 'space-y-2 mt-2',
})``;

const TokenTitle = styled.h2.attrs({
  className: 'text-base leading-normal font-semibold',
})``;

const TokenSubtitle = styled.h2.attrs({
  className: 'text-sm leading-normal text-neutral-600',
})``;

const TokenDescription = styled.h2.attrs({
  className: 'text-sm leading-normal text-center text-neutral-600',
})``;

const WideButton = styled(ButtonText).attrs({
  className: 'w-full justify-center',
})``;

const NoTokenWrapper = styled.div.attrs({
  className: 'space-y-1 mb-6',
})``;

const NoTokenContainer = styled.div.attrs({
  className: `flex flex-col items-center mb-6
    justify-center bg-neutral-100 py-6 px-4 rounded-xl`,
})``;

const IconWrapper = styled.div.attrs({
  className: 'mb-3',
})``;
