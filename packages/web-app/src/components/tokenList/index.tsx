import React from 'react';
import {CardToken} from '@aragon/ui-components';
import {formatUnits} from 'ethers/lib/utils';
import {useTranslation} from 'react-i18next';

import {VaultToken} from 'utils/types';
import {abbreviateTokenAmount} from 'utils/tokens';

type TokenListProps = {
  tokens: VaultToken[];
};

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

// TODO: Pass in current locale to usd value
const TokenList: React.FC<TokenListProps> = ({tokens}) => {
  const {t} = useTranslation();

  if (tokens.length === 0)
    return <p data-testid="tokenList">{t('allTokens.noTokens')}</p>;

  return (
    <div className="space-y-1.5" data-testid="tokenList">
      {tokens.map(token => (
        <CardToken
          key={token.metadata.id}
          tokenName={token.metadata.name}
          tokenSymbol={token.metadata.symbol}
          tokenImageUrl={token.metadata.imgUrl || ''}
          tokenCount={abbreviateTokenAmount(
            formatUnits(token.balance, token.metadata.decimals)
          )}
          {...(!token.marketData
            ? {
                tokenUSDValue: t('finance.unknownUSDValue'),
                treasuryShare: t('finance.unknownUSDValue'),
              }
            : {
                tokenUSDValue: usdFormatter.format(token.marketData.price),
                treasuryShare: usdFormatter.format(
                  token.marketData.balanceValue
                ),
                treasurySharePercentage: `${token.treasurySharePercentage?.toFixed(
                  0
                )}%`,

                // Type of change during interval
                changeType:
                  token.marketData.percentageChangedDuringInterval > 0
                    ? 'Positive'
                    : 'Negative',

                // Percentage change during given interval
                percentageChangeDuringInterval:
                  new Intl.NumberFormat('en-US', {
                    signDisplay: 'always',
                    maximumFractionDigits: 2,
                  }).format(token.marketData.percentageChangedDuringInterval) +
                  '%',

                // Change during interval in currency
                changeDuringInterval: new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  signDisplay: 'always',
                }).format(token.marketData.valueChangeDuringInterval),
              })}
        />
      ))}
    </div>
  );
};

export default TokenList;
