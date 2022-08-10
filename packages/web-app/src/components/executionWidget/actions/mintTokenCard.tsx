import {IconLinkExternal, Link, ListItemAddress} from '@aragon/ui-components';
import {AccordionMethod} from 'components/accordionMethod';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {ActionMintToken} from 'utils/types';

export const MintTokenCard: React.FC<{
  action: ActionMintToken;
}> = ({action}) => {
  const {t} = useTranslation();

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t('labels.mintTokens')}
      smartContractName={t('labels.aragonCore')}
      verified
      additionalInfo={t('newProposal.mintTokens.additionalInfo')}
    >
      <Container>
        <div className="p-2 tablet:p-3 bg-ui-50">
          {action.inputs.mintTokensToWallets.map((wallet, index) => (
            <ListItemAddress
              key={index}
              label={wallet.address}
              src={wallet.address}
              tokenInfo={{amount: 4000, symbol: 'ETH', percentage: '0.1'}}
            />
          ))}
        </div>

        <SummaryContainer>
          <p>{t('labels.summary')}</p>
          <HStack>
            <Label>{t('labels.newTokens')}</Label>
            <p>+4000 ETH</p>
          </HStack>
          <HStack>
            <Label>{t('labels.newHolders')}</Label>
            <p>+2</p>
          </HStack>
          <HStack>
            <Label>{t('labels.totalTokens')}</Label>
            <p>100,000 ETH</p>
          </HStack>
          {/* TODO add total amount of token holders here. */}
          <Link
            label={t('labels.seeCommunity')}
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
