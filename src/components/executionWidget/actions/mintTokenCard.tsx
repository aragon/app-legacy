import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Link, ListItemAddress} from '@aragon/ods-old';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {IconType} from '@aragon/ods';

import {AccordionMethod} from 'components/accordionMethod';
import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {PluginTypes} from 'hooks/usePluginClient';
import {CHAIN_METADATA} from 'utils/constants';
import {Web3Address} from 'utils/library';
import {ActionMintToken} from 'utils/types';
import {useDaoToken} from 'hooks/useDaoToken';

export const MintTokenCard: React.FC<{
  action: ActionMintToken;
}> = ({action}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {api: provider} = useProviders();

  const {data: daoDetails} = useDaoDetailsQuery();
  const {data: daoToken} = useDaoToken(
    daoDetails?.plugins[0].instanceAddress as string
  );

  const {
    data: {members, memberCount},
  } = useDaoMembers(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes,
    {page: 0}
  );

  const [addresses, setAddresses] = useState<Web3Address[]>([]);

  const newTotalSupply = action.summary.newTokens + action.summary.tokenSupply;

  const enableNewHolders = memberCount <= 1000;
  // This would be slow to calculate with 1000 members
  const newHolders = useMemo(
    () =>
      enableNewHolders
        ? action.inputs.mintTokensToWallets.filter(({web3Address}) => {
            return !members.some(
              (addr: {address: string}) =>
                addr.address.toLowerCase() ===
                web3Address.address?.toLowerCase()
            );
          })
        : [],
    [members, enableNewHolders, action.inputs.mintTokensToWallets]
  );

  /*************************************************
   *                    Effects                    *
   *************************************************/
  useEffect(() => {
    async function mapToWeb3Addresses() {
      try {
        const response = await Promise.all(
          action.inputs.mintTokensToWallets.map(
            async ({web3Address: {address, ensName}}) =>
              await Web3Address.create(provider, {address, ensName})
          )
        );

        setAddresses(response);
      } catch (error) {
        console.error('Error creating Web3Addresses', error);
      }
    }

    if (action.inputs.mintTokensToWallets) mapToWeb3Addresses();
  }, [action.inputs.mintTokensToWallets, network, provider]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleAddressClick = useCallback(
    (addressOrEns: string | null) =>
      window.open(
        `${CHAIN_METADATA[network].explorer}address/${addressOrEns}`,
        '_blank'
      ),
    [network]
  );

  /*************************************************
   *                     Render                    *
   *************************************************/
  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t('labels.mintTokens')}
      smartContractName="GovernanceERC20"
      smartContractAddress={daoToken?.address}
      blockExplorerLink={
        daoToken?.address
          ? `${CHAIN_METADATA[network].explorer}token/${daoToken?.address}`
          : undefined
      }
      verified
      methodDescription={t('newProposal.mintTokens.methodDescription')}
      additionalInfo={t('newProposal.mintTokens.additionalInfo')}
    >
      <Container>
        <div className="space-y-4 bg-neutral-50 p-4 md:p-6">
          {action.inputs.mintTokensToWallets.map(
            ({web3Address, amount}, index) => {
              const label =
                web3Address.ensName ||
                addresses[index]?.ensName ||
                web3Address.address;

              const avatar = addresses[index]?.avatar || web3Address.address;
              const percentage = (Number(amount) / newTotalSupply) * 100;

              return web3Address.address ? (
                <ListItemAddress
                  key={web3Address.address}
                  label={label}
                  src={avatar}
                  onClick={() => handleAddressClick(label)}
                  tokenInfo={{
                    amount: parseFloat(Number(amount).toFixed(2)),
                    symbol: action.summary.daoTokenSymbol || '',
                    percentage: parseFloat(percentage.toFixed(2)),
                  }}
                />
              ) : null;
            }
          )}
        </div>

        <SummaryContainer>
          <p className="font-semibold text-neutral-800">
            {t('labels.summary')}
          </p>
          <HStack>
            <Label>{t('labels.newTokens')}</Label>
            <p>
              +{action.summary.newTokens} {action.summary.daoTokenSymbol}
            </p>
          </HStack>
          {enableNewHolders && (
            <HStack>
              <Label>{t('labels.newHolders')}</Label>
              <p>+{newHolders?.length}</p>
            </HStack>
          )}
          <HStack>
            <Label>{t('labels.totalTokens')}</Label>
            <p>
              {newTotalSupply} {action.summary.daoTokenSymbol}
            </p>
          </HStack>
          {enableNewHolders && (
            <HStack>
              <Label>{t('labels.totalHolders')}</Label>
              <p>
                {newHolders?.length +
                  (action.summary.totalMembers || members?.length)}{' '}
              </p>
            </HStack>
          )}
          {/* TODO add total amount of token holders here. */}
          <Link
            label={t('labels.seeAllHolders')}
            href={`${CHAIN_METADATA[network].explorer}/token/tokenholderchart/${action.summary.daoTokenAddress}`}
            iconRight={IconType.LINK_EXTERNAL}
          />
        </SummaryContainer>
      </Container>
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className:
    'bg-neutral-50 border divide-y border-neutral-100 divide-neutral-100 rounded-b-xl border-t-0',
})``;

const SummaryContainer = styled.div.attrs({
  className: 'p-4 md:p-6 space-y-3 font-semibold text-neutral-800',
})``;

const HStack = styled.div.attrs({
  className: 'flex justify-between',
})``;

const Label = styled.p.attrs({
  className: 'font-normal text-neutral-500',
})``;
