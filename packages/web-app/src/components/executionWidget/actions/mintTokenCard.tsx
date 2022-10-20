import React, {useEffect, useState} from 'react';
import {IconLinkExternal, Link, ListItemAddress} from '@aragon/ui-components';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {AccordionMethod} from 'components/accordionMethod';
import {MintTokenDescription} from 'containers/actionBuilder/mintTokens';
import {useNetwork} from 'context/network';
import {CHAIN_METADATA} from 'utils/constants';
import {ActionMintToken} from 'utils/types';
import {useDaoParam} from 'hooks/useDaoParam';
import {useDaoToken} from 'hooks/useDaoToken';
import {formatUnits} from 'ethers/lib/utils';
import {useProviders} from 'context/providers';
import {useDaoDetails} from 'hooks/useDaoDetails';
import Big from 'big.js';
import {getTokenInfo} from 'utils/tokens';

export const MintTokenCard: React.FC<{
  action: ActionMintToken;
}> = ({action}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {data: daoId} = useDaoParam();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetails(daoId);
  const {data: daoToken, isLoading: daoTokenLoading} = useDaoToken(
    daoDetails?.plugins[0].instanceAddress as string
  );
  const [tokenSupply, setTokenSupply] = useState<Big>(Big(0));
  const nativeCurrency = CHAIN_METADATA[network].nativeCurrency;
  const {infura} = useProviders();

  const newHoldersCount = action.summary.newHoldersCount;
  const newTokens = action.summary.newTokens;

  useEffect(() => {
    // Fetching necessary info about the token.
    if (daoToken?.address) {
      getTokenInfo(daoToken.address, infura, nativeCurrency)
        .then((r: Awaited<ReturnType<typeof getTokenInfo>>) => {
          const formattedNumber = parseFloat(
            formatUnits(r.totalSupply, r.decimals)
          );
          setTokenSupply(Big(formattedNumber));
        })
        .catch(e =>
          console.error('Error happened when fetching token infos: ', e)
        );
    }
  }, [daoToken?.address, infura, nativeCurrency]);
  // This should be replace With Skeleton loading in near future
  if (detailsAreLoading || daoTokenLoading) return <></>;

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t('labels.mintTokens')}
      smartContractName={t('labels.aragonCore')}
      verified
      methodDescription={<MintTokenDescription />}
      additionalInfo={t('newProposal.mintTokens.additionalInfo')}
    >
      <Container>
        <div className="p-2 tablet:p-3 space-y-2 bg-ui-50">
          {action.inputs.mintTokensToWallets.map((wallet, index) => {
            const newTokenSupply = Big(Number(newTokens)).plus(tokenSupply);

            let percentage;
            try {
              percentage =
                newTokenSupply && !newTokenSupply.eq(Big(0))
                  ? Big(Number(wallet.amount)).div(newTokenSupply).mul(Big(100))
                  : Big(0);
            } catch {
              percentage = Big(0);
            }
            return wallet.address ? (
              <ListItemAddress
                key={index}
                label={wallet.address}
                src={wallet.address}
                onClick={() =>
                  window.open(
                    `${CHAIN_METADATA[network].explorer}address/${wallet.address}`,
                    '_blank'
                  )
                }
                tokenInfo={{
                  amount: Big(Number(wallet.amount)).toNumber(),
                  symbol: daoToken?.symbol || '',
                  percentage: percentage.toPrecision(3),
                }}
              />
            ) : null;
          })}
        </div>

        <SummaryContainer>
          <p className="font-bold text-ui-800">{t('labels.summary')}</p>
          <HStack>
            <Label>{t('labels.newTokens')}</Label>
            <p>
              +{Number(newTokens)} {daoToken?.symbol}
            </p>
          </HStack>
          <HStack>
            <Label>{t('labels.newHolders')}</Label>
            <p>+{newHoldersCount}</p>
          </HStack>
          <HStack>
            <Label>{t('labels.totalTokens')}</Label>
            {tokenSupply ? (
              <p>
                {tokenSupply.toNumber() + Number(newTokens)} {daoToken?.symbol}
              </p>
            ) : (
              <p>...</p>
            )}
          </HStack>
          {/* TODO add total amount of token holders here. */}
          <Link
            label={t('labels.seeCommunity')}
            href={`${CHAIN_METADATA[network].explorer}/token/tokenholderchart/${daoToken?.address}`}
            iconRight={<IconLinkExternal />}
          />
        </SummaryContainer>
      </Container>
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className:
    'bg-ui-50 border divide-y border-ui-100 divide-ui-100 rounded-b-xl border-t-0',
})``;

const SummaryContainer = styled.div.attrs({
  className: 'p-2 tablet:p-3 space-y-1.5 font-bold text-ui-800',
})``;

const HStack = styled.div.attrs({
  className: 'flex justify-between',
})``;

const Label = styled.p.attrs({
  className: 'font-normal text-ui-500',
})``;
