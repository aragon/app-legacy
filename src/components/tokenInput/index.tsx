import {TokenType} from '@aragon/sdk-client-common';
import {useNetwork} from 'context/network';
import {constants} from 'ethers';
import {useDaoBalances} from 'hooks/useDaoBalances';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import React, {ChangeEvent, useEffect, useState} from 'react';
import {useNetworkTokens} from 'services/aragon-backend/queries/use-network-tokens';
import {useToken} from 'services/token/queries/use-token';
import {IFetchTokenParams} from 'services/token/token-service.api';
import {styled} from 'styled-components';
import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';
import {formatUnits} from 'utils/library';

export interface TokenInputValue {
  amount?: number;
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  balance?: string;
}

export interface TokenDropdownValue {
  address: string;
  symbol: string;
  balance?: BigInt;
  decimals?: number;
}

export interface TokenInputProps {
  tokenAmount?: number;
  tokenAddress?: string;
  network?: SupportedNetworks;
  showAmount?: boolean;
  onChange?: (tokenVal?: TokenInputValue) => void;
  disabled?: boolean;
}

interface TokenInputPropsWithData extends TokenInputProps {
  isLoading?: boolean;
  tokensDropdown: TokenDropdownValue[];
}

/**
 * Display only Token Input component
 */
const TokenInput: React.FC<TokenInputPropsWithData> = ({
  tokenAmount,
  tokenAddress,
  network,
  showAmount,
  onChange,
  disabled,
  isLoading,
  tokensDropdown,
}) => {
  const [amount, setAmount] = useState(tokenAmount);
  const [tokenDropdownValue, setTokenDropdownValue] = useState<
    TokenDropdownValue | undefined
  >(undefined);

  const {data: token} = useToken(
    {
      address: tokenDropdownValue?.address || '',
      network: network || 'ethereum',
    },
    {enabled: !!tokenDropdownValue?.address}
  );

  const isEmpty =
    isLoading || !tokensDropdown.some(t => t.address === tokenAddress);

  useEffect(() => {
    if (token && tokenDropdownValue) {
      onChange?.({
        amount,
        address: tokenDropdownValue.address,
        decimals: tokenDropdownValue.decimals || 18,
        symbol: token.symbol,
        name: token.name,
        balance: tokenDropdownValue.balance?.toString(),
      });
    }
  }, [token]);

  const handleInputChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const amt = parseFloat(ev.currentTarget.value);

    setAmount(isNaN(amt) ? undefined : amt);
  };

  const handleSelectChange = (ev: ChangeEvent<HTMLSelectElement>) => {
    const addr = ev.currentTarget.value;
    const tok = tokensDropdown.find(t => t.address === addr);
    setTokenDropdownValue(tok);
  };

  return (
    <Container disabled={disabled || false}>
      {showAmount && (
        <StyledNumberInput
          type="number"
          disabled={disabled || false}
          value={amount}
          onChange={handleInputChange}
        />
      )}
      <StyledSelect
        onChange={handleSelectChange}
        disabled={disabled || false}
        placeholder="Choose token"
      >
        {isLoading ? (
          <option>Loading...</option>
        ) : (
          <>
            <option key="" value="" selected={isEmpty}>
              {tokensDropdown.length === 0
                ? 'No tokens available'
                : 'Choose a token'}
            </option>
            {tokensDropdown.map(token => (
              <option
                key={token.address}
                value={token.address}
                selected={tokenDropdownValue?.address === token.address}
              >
                {token.symbol}
                {token?.balance !== undefined &&
                  token?.decimals !== undefined &&
                  '(' +
                    formatUnits(token.balance.toString(), token.decimals) +
                    ')'}
              </option>
            ))}
          </>
        )}
      </StyledSelect>
    </Container>
  );
};

export const WalletTokenInput: React.FC<TokenInputProps> = ({
  tokenAmount,
  tokenAddress,
  showAmount,
  onChange,
  disabled,
}) => {
  const {network} = useNetwork();

  const {data: daoDetails, isLoading: isDaoDetailsLoading} =
    useDaoDetailsQuery();

  const {data: balances, isLoading: isBalancesLoading} = useDaoBalances(
    daoDetails?.address ?? ''
  );

  const tokensDropdown = balances
    ?.map(b => {
      switch (b.type) {
        case TokenType.ERC20:
          return {
            address: b.id,
            symbol: b.symbol,
            balance: b.balance,
            decimals: b.decimals,
          };
        case TokenType.NATIVE:
          return {
            address: constants.AddressZero,
            symbol: CHAIN_METADATA[network].nativeCurrency.symbol,
            balance: b.balance,
            decimals: CHAIN_METADATA[network].nativeCurrency.decimals,
          };
      }
    })
    .filter(b => b !== undefined) as TokenDropdownValue[];

  const isLoading = isDaoDetailsLoading || isBalancesLoading;

  return (
    <TokenInput
      tokenAmount={tokenAmount}
      tokenAddress={tokenAddress}
      showAmount={showAmount}
      onChange={onChange}
      disabled={disabled}
      isLoading={isLoading}
      tokensDropdown={tokensDropdown ?? []}
    />
  );
};

export const NetworkTokenInput: React.FC<TokenInputProps> = ({
  tokenAmount,
  tokenAddress,
  showAmount,
  onChange,
  disabled,
}) => {
  const {network} = useNetwork();

  const {data: tokens, isLoading} = useNetworkTokens(network);

  return (
    <TokenInput
      tokenAmount={tokenAmount}
      tokenAddress={tokenAddress}
      showAmount={showAmount}
      onChange={onChange}
      disabled={disabled}
      isLoading={isLoading}
      tokensDropdown={[]}
    />
  );
};

const StyledSelect = styled.select.attrs({
  className: `w-full border-none  py-1.5 px-2 rounded-r-xl
     bg-neutral-50 text-neutral-600`,
})`
  outline: 0;
`;

const StyledNumberInput = styled.input.attrs<{disabled: boolean}>(
  ({disabled}) => {
    const className: string | undefined = `${
      disabled ? 'text-neutral-300' : 'text-neutral-600'
    } bg-[transparent] margin-0 w-24`;
    return {
      className,
    };
  }
)<{disabled: boolean}>`
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  -moz-appearance: textfield;
  text-align: center;
  outline: 0;
`;

const Container = styled.div.attrs<{disabled: boolean}>(({disabled}) => {
  let className = `${
    disabled ? 'bg-neutral-100' : 'bg-neutral-0'
  } inline-flex bg-neutral-0 w-full
      focus:outline-none items-center
      focus-within:border-primary-500 focus-within:hover:border-primary-500 justify-between
      rounded-xl hover:border-neutral-300 border-2 active:border-primary-500
    `;

  className += 'border-neutral-100';

  return {
    className,
  };
})<{disabled: boolean}>``;
