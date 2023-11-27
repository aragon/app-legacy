import {useDaoBalances} from 'hooks/useDaoBalances';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useTokenMetadata} from 'hooks/useTokenMetadata';
import React, {ChangeEvent, useEffect, useState} from 'react';
import {styled} from 'styled-components';
import {formatUnits} from 'utils/library';

export interface TokenInputValue {
  amount?: number;
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  balance: string;
}

export interface TokenInputProps {
  tokenAmount?: number;
  tokenAddress?: string;
  showAmount?: boolean;
  onChange?: (tokenVal?: TokenInputValue) => void;
  disabled?: boolean;
}

export const TokenInput: React.FC<TokenInputProps> = ({
  tokenAmount,
  tokenAddress,
  showAmount,
  onChange,
  disabled,
}) => {
  const {data: daoDetails, isLoading: isDaoDetailsLoading} =
    useDaoDetailsQuery();

  const {data: balances, isLoading: isBalancesLoading} = useDaoBalances(
    daoDetails?.address ?? ''
  );
  const {data: tokensWithMetadata, isLoading: isTokensMetadataLoading} =
    useTokenMetadata(balances);

  const [amount, setAmount] = useState(tokenAmount);
  const [address, setAddress] = useState(tokenAddress);

  const isLoading =
    isDaoDetailsLoading || isBalancesLoading || isTokensMetadataLoading;
  const isEmpty =
    isLoading || !tokensWithMetadata.some(t => t.metadata.id === tokenAddress);

  useEffect(() => {
    if (!isLoading) {
      const tok = tokensWithMetadata.find(t => t.metadata.id === address);
      const tokenValue =
        tok === undefined
          ? undefined
          : ({
              amount,
              address: tok.metadata.id,
              decimals: tok?.metadata.decimals,
              symbol: tok?.metadata.symbol,
              name: tok?.metadata.name,
              balance: tok?.balance.toString(),
            } as TokenInputValue);
      onChange?.(tokenValue);
    }
  }, [amount, address, tokensWithMetadata, isLoading, onChange]);

  const handleInputChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const amt = parseFloat(ev.currentTarget.value);

    setAmount(isNaN(amt) ? undefined : amt);
  };

  const handleSelectChange = (ev: ChangeEvent<HTMLSelectElement>) => {
    const addr = ev.currentTarget.value;
    setAddress(addr);
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
              {tokensWithMetadata.length === 0
                ? 'No tokens available'
                : 'Choose a token'}
            </option>
            {tokensWithMetadata.map(token => (
              <option
                key={token.metadata.id}
                value={token.metadata.id}
                selected={address === token.metadata.id}
              >
                {token.metadata.symbol} (
                {formatUnits(token.balance, token.metadata.decimals)})
              </option>
            ))}
          </>
        )}
      </StyledSelect>
    </Container>
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
