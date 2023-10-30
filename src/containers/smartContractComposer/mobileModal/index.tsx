import {
  ButtonIcon,
  ButtonText,
  IconChevronLeft,
  IconClose,
  IconHome,
  IconLinkExternal,
  Link,
} from '@aragon/ods-old';
import React, {useEffect, useState} from 'react';
import {useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import styled from 'styled-components';

import BottomSheet from 'components/bottomSheet';
import {StateEmpty} from 'components/stateEmpty';
import {trackEvent} from 'services/analytics';
import {actionsFilter} from 'utils/contract';
import {SmartContract, SmartContractAction} from 'utils/types';
import {SccFormData} from '..';
import ActionListGroup from '../components/actionListGroup';
import InputForm from '../components/inputForm';
import {ListHeaderContract} from '../components/listHeaderContract';
import SmartContractListGroup from '../components/smartContractListGroup';

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
                <ButtonText
                  mode="secondary"
                  size="large"
                  label={t('scc.labels.connect')}
                  onClick={() => {
                    trackEvent('newProposal_connectSmartContract_clicked', {
                      dao_address: daoAddressOrEns,
                    });
                    props.onConnectNew();
                  }}
                  className="w-full"
                />
                <Link
                  external
                  type="primary"
                  iconRight={<IconLinkExternal height={13} width={13} />}
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

  return (
    <Container>
      <StateEmpty
        mode="inline"
        type="Object"
        object="smart_contract"
        title={t('scc.selectionEmptyState.title')}
        description={t('scc.selectionEmptyState.description')}
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
        <ButtonIcon
          mode="secondary"
          size="small"
          icon={<IconChevronLeft />}
          bgWhite
          onClick={props.onBackButtonClicked}
        />
      ) : (
        <ButtonIcon mode="secondary" size="small" icon={<IconHome />} bgWhite />
      )}

      <ActionSearchInput
        type="text"
        placeholder={t('scc.labels.searchPlaceholder')}
        onChange={ev => props.onSearch(ev.target.value)}
      />

      <ButtonIcon
        mode="secondary"
        size="small"
        icon={<IconClose />}
        onClick={props.onClose}
        bgWhite
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
