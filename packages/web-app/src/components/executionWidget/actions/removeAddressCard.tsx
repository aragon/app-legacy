import {ListItemAddress} from '@aragon/ods';
import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {AccordionMethod} from 'components/accordionMethod';
import AccordionSummary from 'containers/actionBuilder/addAddresses/accordionSummary';
import {useNetwork} from 'context/network';
import {CHAIN_METADATA} from 'utils/constants';
import {ActionRemoveAddress} from 'utils/types';
import {Web3Address} from 'utils/library';
import {useProviders} from 'context/providers';

export const RemoveAddressCard: React.FC<{
  action: ActionRemoveAddress;
}> = ({action}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {infura: provider} = useProviders();

  const [displayedAddresses, setDisplayedAddresses] = useState<Web3Address[]>(
    []
  );

  /*************************************************
   *                    Effects                    *
   *************************************************/
  useEffect(() => {
    async function filterAddresses() {
      let memberAddresses:
        | ActionRemoveAddress['inputs']['memberWallets']
        | Array<Web3Address> = action.inputs.memberWallets.filter(
        wallet => wallet.address
      );

      try {
        memberAddresses = await Promise.all(
          memberAddresses.map(async ({address, ensName}) => {
            return await Web3Address.create(provider, {address, ensName});
          })
        );
      } catch (error) {
        console.error('Error creating Web3Addresses', error);
      }

      setDisplayedAddresses(memberAddresses as Array<Web3Address>);
    }

    if (action.inputs.memberWallets) filterAddresses();
  }, [action.inputs.memberWallets, provider]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleAddressClick = useCallback(
    (addressOrEns: string | null) => {
      window.open(
        `${CHAIN_METADATA[network].explorer}address/${addressOrEns}`,
        '_blank'
      );
    },
    [network]
  );

  /*************************************************
   *                    Render                    *
   *************************************************/
  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t('labels.removeWallets')}
      smartContractName={t('labels.aragonOSx')}
      verified
      methodDescription={t('labels.removeWalletsDescription')}
    >
      <Container>
        {displayedAddresses.map(({address, avatar, ensName}) => (
          <ListItemAddress
            label={ensName || address}
            src={avatar || address}
            key={address}
            onClick={() => handleAddressClick(ensName || address)}
          />
        ))}
      </Container>
      <AccordionSummary
        type="execution-widget"
        total={action.inputs.memberWallets.length}
        IsRemove
      />
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className: 'bg-ui-50 border border-t-0 border-ui-100 space-y-1 p-2',
})``;
