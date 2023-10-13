import {ListItemAddress} from '@aragon/ods-old';
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
}> = ({action: {inputs}}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {api: provider} = useProviders();

  const [addresses, setAddresses] = useState<Web3Address[]>([]);

  /*************************************************
   *                    Effects                    *
   *************************************************/
  useEffect(() => {
    async function mapToWeb3Addresses() {
      try {
        const response = await Promise.all(
          inputs.memberWallets.map(
            async ({address, ensName}) =>
              await Web3Address.create(provider, {address, ensName})
          )
        );

        setAddresses(response);
      } catch (error) {
        console.error('Error creating Web3Addresses', error);
      }
    }

    if (inputs.memberWallets) mapToWeb3Addresses();
  }, [inputs.memberWallets, network, provider]);

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
        {inputs.memberWallets.map(({address, ensName}, index) => {
          const label = ensName || addresses[index]?.ensName || address;

          return (
            <ListItemAddress
              label={label}
              src={addresses[index]?.avatar || address}
              key={address}
              onClick={() => handleAddressClick(label)}
            />
          );
        })}
      </Container>
      <AccordionSummary
        type="execution-widget"
        total={inputs.memberWallets.length}
      />
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className: 'bg-ui-50 border border-t-0 border-ui-100 space-y-1 p-2',
})``;
