import {WalletInputLegacy} from '@aragon/ods-old';
import {DaoDetails, DaoUpdateDecodedParams} from '@aragon/sdk-client';
import {
  LIVE_CONTRACTS,
  SupportedNetworksArray,
} from '@aragon/sdk-client-common';
import {AccordionMethod} from 'components/accordionMethod';
import {useNetwork} from 'context/network';
import {useClient} from 'hooks/useClient';
import {useProtocolVersions} from 'hooks/useDaoVersions';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {ETH_TRANSACTION_CALL_LABEL} from 'utils/constants';
import {translateToNetworkishName} from 'utils/library';
import {ActionOSUpdate} from 'utils/types';

export const UpdateOSCard: React.FC<{
  action: ActionOSUpdate;
  dao: DaoDetails;
}> = ({action, dao}) => {
  const {t} = useTranslation();
  const {client} = useClient();
  const {network} = useNetwork();
  const translatedNetwork = translateToNetworkishName(network);
  const {data: versions} = useProtocolVersions(dao?.address);
  const [decodedAction, setDecodedAction] = useState<
    DaoUpdateDecodedParams | undefined
  >();

  useEffect(() => {
    async function extractOSUpdateAction() {
      if (
        translatedNetwork !== 'unsupported' &&
        SupportedNetworksArray.includes(translatedNetwork) &&
        dao?.address &&
        versions
      ) {
        const encodedAction = await client?.encoding.daoUpdateAction(
          dao?.address,
          {
            previousVersion: versions as [number, number, number],
            daoFactoryAddress:
              LIVE_CONTRACTS[action.inputs.version][translatedNetwork]
                .daoFactoryAddress,
          }
        );

        if (encodedAction)
          setDecodedAction(
            client?.decoding.daoUpdateAction(encodedAction.data)
          );
      }
    }

    extractOSUpdateAction();
  }, [
    action.inputs.version,
    client?.decoding,
    client?.encoding,
    dao?.address,
    translatedNetwork,
    versions,
  ]);

  console.log('view', decodedAction);

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={ETH_TRANSACTION_CALL_LABEL}
      smartContractName={t('labels.aragonOSx')}
      verified
    >
      <Container>
        {decodedAction && (
          <div className="space-y-4">
            {Object.entries(decodedAction).map(([key, value]) => {
              console.log('key', value);

              return (
                <div key={key}>
                  <div className="mb-3 text-base font-semibold capitalize leading-normal text-neutral-800">
                    {key}
                    <span className="ml-1 text-sm normal-case leading-normal">
                      ({typeof value})
                    </span>
                  </div>
                  <WalletInputLegacy
                    mode="default"
                    name={key}
                    value={value.toString()}
                    disabledFilled={true}
                  />
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className:
    'bg-neutral-50 rounded-b-xl border border-t-0 border-neutral-100 space-y-6 p-6',
})``;
