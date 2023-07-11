import {ListItemAddress} from '@aragon/ui-components/src/components/listItem/address';
import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {AccordionMethod} from 'components/accordionMethod';
import AccordionSummary from 'containers/actionBuilder/addAddresses/accordionSummary';
import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {CHAIN_METADATA} from 'utils/constants';
import {Web3Address} from 'utils/library';
import {ActionAddAddress} from 'utils/types';

export const AddAddressCard: React.FC<{
  action: ActionAddAddress;
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
        | ActionAddAddress['inputs']['memberWallets']
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
    (addressOrEns: string | null) =>
      window.open(
        `${CHAIN_METADATA[network].explorer}address/${addressOrEns}`,
        '_blank'
      ),
    [network]
  );

  /*************************************************
   *                    Render                    *
   *************************************************/
  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t('labels.addWallets')}
      smartContractName={t('labels.aragonOSx')}
      verified
      methodDescription={t('labels.addWalletsDescription')}
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
        total={displayedAddresses.length}
      />
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className: 'bg-ui-50 border border-t-0 border-ui-100 space-y-1 p-2',
})``;
