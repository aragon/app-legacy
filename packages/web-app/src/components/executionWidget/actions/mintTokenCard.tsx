import {IconLinkExternal, Link, ListItemAddress} from '@aragon/ui-components';
import {AccordionMethod} from 'components/accordionMethod';
import {MintTokenDescription} from 'containers/actionBuilder/mintTokens';
import {useNetwork} from 'context/network';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoParam} from 'hooks/useDaoParam';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {CHAIN_METADATA} from 'utils/constants';
import {ActionMintToken} from 'utils/types';

export const MintTokenCard: React.FC<{
  action: ActionMintToken;
}> = ({action}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {data: daoId} = useDaoParam();
  const {
    data: {token},
  } = useDaoMembers(daoId);

  const {newTokens, newHoldersCount, tokenSupply, daoTokenSymbol} =
    action.summary;

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
            const newTokenSupply = newTokens + tokenSupply;
            const amount = Number(wallet.amount);

            const percentage = newTokenSupply
              ? (amount / newTokenSupply) * 100
              : 0;

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
                  amount,
                  symbol: daoTokenSymbol,
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
              +{newTokens} {daoTokenSymbol}
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
                {(tokenSupply + newTokens).toString()} {daoTokenSymbol}
              </p>
            ) : (
              <p>...</p>
            )}
          </HStack>
          {/* TODO add total amount of token holders here. */}
          <Link
            label={t('labels.seeCommunity')}
            href={`${CHAIN_METADATA[network].explorer}/token/tokenholderchart/${token?.id}`}
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
