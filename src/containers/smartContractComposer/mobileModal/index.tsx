import React, {useEffect, useState} from 'react';
import {Link} from '@aragon/ods-old';
import {Button, EmptyState, Icon, IconType} from '@aragon/ods';

import {useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import styled from 'styled-components';

import BottomSheet from 'components/bottomSheet';
import {trackEvent} from 'services/analytics';
import {actionsFilter} from 'utils/contract';
import {SmartContract, SmartContractAction} from 'utils/types';
import {SccFormData} from '..';
import ActionListGroup from '../components/actionListGroup';
import InputForm from '../components/inputForm';
import {ListHeaderContract} from '../components/listHeaderContract';
import SmartContractListGroup from '../components/smartContractListGroup';
import {useNetwork} from 'context/network';
import {CHAIN_METADATA} from 'utils/constants';

type Props = {
  isOpen: boolean;
  actionIndex: number;
  onClose: () => void;
  onConnectNew: () => void;
  onBackButtonClicked: () => void;
  onComposeButtonClicked: (addAnother: boolean) => void;
  onRemoveContract: (address: string) => void;
};

const MobileModal: React.FC<Props> = props => {
  const {t} = useTranslation();
  const {dao: daoAddressOrEns} = useParams();

  const [selectedSC, selectedAction]: [SmartContract, SmartContractAction] =
    useWatch({
      name: ['selectedSC', 'selectedAction'],
    });
  const [search, setSearch] = useState('');
  const {setValue, getValues} = useFormContext<SccFormData>();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const contracts = getValues('contracts') || [];
  const autoSelectedContract = contracts.length === 1 ? contracts[0] : null;

  useEffect(() => {
    setValue('selectedSC', autoSelectedContract);
    if (autoSelectedContract) {
      setValue(
        'selectedAction',
        autoSelectedContract.actions.filter(
          a =>
            a.type === 'function' &&
            (a.stateMutability === 'payable' ||
              a.stateMutability === 'nonpayable')
        )?.[0]
      );
    }
  }, [autoSelectedContract, setValue]);

  return (
    <BottomSheet isOpen={props.isOpen} onClose={props.onClose}>
      <CustomMobileHeader
        onClose={props.onClose}
        onBackButtonClicked={() => {
          if (selectedAction) {
            //eslint-disable-next-line
            //@ts-ignore
            setValue('selectedAction', null);
          } else if (selectedSC !== null) {
            setValue('selectedSC', null);
          } else {
            props.onBackButtonClicked();
          }
        }}
        onSearch={setSearch}
      />
      <Content>
        {!selectedAction ? (
          selectedSC ? (
            <div>
              <ListHeaderContract
                key={selectedSC.address}
                sc={selectedSC}
                onRemoveContract={props.onRemoveContract}
              />
              <ActionListGroup
                actions={selectedSC.actions.filter(actionsFilter(search))}
              />
            </div>
          ) : (
            <>
              {contracts.length === 0 ? (
                <MobileModalEmptyState />
              ) : (
                <SmartContractListGroup />
              )}
              <div>
                <Button
                  variant="tertiary"
                  size="lg"
                  onClick={() => {
                    trackEvent('newProposal_connectSmartContract_clicked', {
                      dao_address: daoAddressOrEns,
                    });
                    props.onConnectNew();
                  }}
                  className="w-full"
                >
                  {t('scc.labels.connect')}
                </Button>
                <Link
                  external
                  type="primary"
                  iconRight={<Icon icon={IconType.LINK_EXTERNAL} size="sm" />}
                  href={t('scc.listContracts.learnLinkURL')}
                  label={t('scc.listContracts.learnLinkLabel')}
                  className="mt-4 w-full justify-center"
                />
              </div>
            </>
          )
        ) : (
          selectedSC && (
            <InputForm
              actionIndex={props.actionIndex}
              onComposeButtonClicked={props.onComposeButtonClicked}
            />
          )
        )}
      </Content>
    </BottomSheet>
  );
};

export default MobileModal;

const MobileModalEmptyState: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  return (
    <Container>
      <EmptyState
        objectIllustration={{object: 'SMART_CONTRACT'}}
        heading={t('scc.selectionEmptyState.title')}
        description={t('scc.selectionEmptyState.description', {
          networkName: CHAIN_METADATA[network].name,
        })}
      />
    </Container>
  );
};

const Container = styled.div.attrs({
  'data-test-id': 'empty-container',
  className: 'flex h-full bg-neutral-0 p-12 pt-0 justify-center items-center',
})``;

type CustomHeaderProps = {
  onBackButtonClicked: () => void;
  onClose?: () => void;
  onSearch: (search: string) => void;
};
const CustomMobileHeader: React.FC<CustomHeaderProps> = props => {
  const {t} = useTranslation();
  const selectedSC: SmartContract = useWatch({name: 'selectedSC'});

  return (
    <Header>
      {selectedSC ? (
        <Button
          variant="tertiary"
          size="sm"
          iconLeft={IconType.CHEVRON_LEFT}
          onClick={props.onBackButtonClicked}
        />
      ) : (
        <Button variant="tertiary" size="sm" iconLeft={IconType.HOME} />
      )}

      <ActionSearchInput
        type="text"
        placeholder={t('scc.labels.searchPlaceholder')}
        onChange={ev => props.onSearch(ev.target.value)}
      />

      <Button
        variant="tertiary"
        size="sm"
        iconLeft={IconType.CLOSE}
        onClick={props.onClose}
      />
    </Header>
  );
};

const Header = styled.div.attrs({
  className: 'flex items-center rounded-xl space-x-4 p-4 bg-neutral-0',
})`
  box-shadow:
    0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const Content = styled.div.attrs({
  className: 'py-6 px-4 space-y-6 overflow-auto',
})`
  max-height: 70vh;
`;

const ActionSearchInput = styled.input.attrs({
  className:
    'flex-1 text-neutral-300 bg-neutral-0 ft-text-base focus:outline-none',
})``;
