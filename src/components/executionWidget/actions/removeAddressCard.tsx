import {ListItemAddress} from '@aragon/ods';
import {fetchEnsAvatar} from '@wagmi/core';
import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {GetEnsAvatarReturnType} from 'viem/ens';

import {AccordionMethod} from 'components/accordionMethod';
import AccordionSummary from 'containers/actionBuilder/addAddresses/accordionSummary';
import {useNetwork} from 'context/network';
import {CHAIN_METADATA} from 'utils/constants';
import {ActionRemoveAddress} from 'utils/types';

export const RemoveAddressCard: React.FC<{
  action: ActionRemoveAddress;
}> = ({action: {inputs}}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  const [avatars, setAvatars] = useState<GetEnsAvatarReturnType[]>([]);

  /*************************************************
   *                    Effects                    *
   *************************************************/
  useEffect(() => {
    async function fetchAvatars() {
      const chainId = CHAIN_METADATA[network].id;

      try {
        const avatars = await Promise.all(
          inputs.memberWallets.map(async ({ensName: name}) => {
            if (name) return await fetchEnsAvatar({name, chainId});
            else return null;
          })
        );

        setAvatars(avatars);
      } catch (error) {
        console.error('Error fetching ENS avatar', error);
      }
    }

    if (inputs.memberWallets) fetchAvatars();
  }, [inputs.memberWallets, network]);

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
        {inputs.memberWallets.map(({address, ensName}, index) => (
          <ListItemAddress
            label={ensName || address}
            src={avatars[index] || address}
            key={address}
            onClick={() => handleAddressClick(ensName || address)}
          />
        ))}
      </Container>
      <AccordionSummary
        type="execution-widget"
        total={inputs.memberWallets.length}
        IsRemove
      />
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className: 'bg-ui-50 border border-t-0 border-ui-100 space-y-1 p-2',
})``;
