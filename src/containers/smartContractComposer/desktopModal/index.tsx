import {
  ButtonText,
  IconLinkExternal,
  IconSwitch,
  Link,
  Modal,
} from '@aragon/ods-old';
import React, {useEffect, useState} from 'react';
import {useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import Header from 'components/modalHeader/searchHeader';
import {StateEmpty} from 'components/stateEmpty';
import {useParams} from 'react-router-dom';
import {trackEvent} from 'services/analytics';
import {actionsFilter} from 'utils/contract';
import {SmartContract, SmartContractAction} from 'utils/types';
import {SccFormData} from '..';
import ActionListGroup from '../components/actionListGroup';
import InputForm from '../components/inputForm';
import {ListHeaderContract} from '../components/listHeaderContract';
import SmartContractListGroup from '../components/smartContractListGroup';

type DesktopModalProps = {
  isOpen: boolean;
  actionIndex: number;
  onClose: () => void;
  onConnectNew: () => void;
  onBackButtonClicked: () => void;
  onComposeButtonClicked: (addAnother: boolean) => void;
  onRemoveContract: (address: string) => void;
};

const DesktopModal: React.FC<DesktopModalProps> = props => {
  const {t} = useTranslation();
  const {dao: daoAddressOrEns} = useParams();
  const [selectedSC, selectedAction]: [SmartContract, SmartContractAction] =
    useWatch({
      name: ['selectedSC', 'selectedAction'],
    });
  const [search, setSearch] = useState('');
  const {getValues, setValue, resetField} = useFormContext<SccFormData>();

  console.log('selectedSC', selectedSC);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const contracts = getValues('contracts') || [];
  const autoSelectedContract = contracts.length === 1 ? contracts[0] : null;

  const handleInteractOutside = () => {
    // Do nothing when interacting outside the modal
  };

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
    <StyledModal
      isOpen={props.isOpen}
      onClose={props.onClose}
      onInteractOutside={handleInteractOutside}
    >
      <Header
        onClose={props.onClose}
        selectedValue={selectedSC?.name}
        onSearch={setSearch}
        searchPlaceholder={t('scc.labels.searchPlaceholder')}
        onHomeButtonClick={() => {
          resetField('selectedSC');
          resetField('selectedAction');
        }}
      />
      <Wrapper>
        <Aside>
          {selectedSC ? (
            <>
              <ListHeaderContract
                key={selectedSC.address}
                sc={selectedSC}
                onRemoveContract={props.onRemoveContract}
              />
              <ActionListGroup
                actions={selectedSC.actions.filter(actionsFilter(search))}
              />
            </>
          ) : (
            <>
              <SmartContractListGroup />
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
          )}
        </Aside>

        <Main>
          {selectedSC ? (
            selectedAction ? (
              <InputForm
                actionIndex={props.actionIndex}
                onComposeButtonClicked={props.onComposeButtonClicked}
              />
            ) : (
              <EmptyActionsState selectedSC={selectedSC} />
            )
          ) : (
            <DesktopModalEmptyState />
          )}
        </Main>
      </Wrapper>
    </StyledModal>
  );
};

export default DesktopModal;

const EmptyActionsState: React.FC<{selectedSC: SmartContract}> = ({
  selectedSC,
}) => {
  const {t} = useTranslation();
  const {setValue} = useFormContext<SccFormData>();

  return (
    <Container>
      <div>
        <StateEmpty
          mode="inline"
          type="Object"
          object="smart_contract"
          title={t('scc.writeContractEmptyState.title')}
          description={t('scc.writeContractEmptyState.desc')}
        />
        {selectedSC.implementationData && (
          <ButtonText
            className="mx-auto mt-6"
            iconLeft={<IconSwitch />}
            label={t('scc.writeContractEmptyState.ctaLabel')}
            onClick={() => {
              setValue(
                'selectedSC',
                selectedSC.implementationData as SmartContract
              );
              setValue(
                'selectedAction',
                (selectedSC.implementationData as SmartContract).actions.filter(
                  a =>
                    a.type === 'function' &&
                    (a.stateMutability === 'payable' ||
                      a.stateMutability === 'nonpayable')
                )?.[0]
              );
            }}
          />
        )}
      </div>
    </Container>
  );
};

const DesktopModalEmptyState: React.FC = () => {
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

const Wrapper = styled.div.attrs({className: 'flex flex-1 overflow-auto'})``;

const Aside = styled.div.attrs({
  className:
    'flex flex-col justify-between overflow-auto p-6 w-80 bg-neutral-50 border-r border-neutral-100',
})``;

const Main = styled.div.attrs({
  className: 'overflow-auto flex-1',
})``;

const Container = styled.div.attrs({
  className: 'flex h-full bg-neutral-0 p-12 pt-0 justify-center items-center',
})``;

const StyledModal = styled(Modal).attrs({
  style: {
    position: 'fixed',
    display: 'flex',
    flexDirection: 'column',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: 12,
    width: '898px',
    height: '708px',
    outline: 'none',
    overflow: 'auto',
    boxShadow: `0px 24px 32px rgba(31, 41, 51, 0.04),
       0px 16px 24px rgba(31, 41, 51, 0.04),
       0px 4px 8px rgba(31, 41, 51, 0.04),
       0px 0px 1px rgba(31, 41, 51, 0.04)`,
  },
})``;
