import {ButtonText, IconFeedback, Link, Modal} from '@aragon/ui-components';
import React, {useEffect, useState} from 'react';
import {useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import Header from 'components/modalHeader/searchHeader';
import {StateEmpty} from 'components/stateEmpty';
import {useParams} from 'react-router-dom';
import {trackEvent} from 'services/analytics';
import {actionsFilter} from 'utils/contract';
import {SmartContract} from 'utils/types';
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
  const [selectedSC]: [SmartContract] = useWatch({
    name: ['selectedSC'],
  });
  const [search, setSearch] = useState('');
  const {getValues, setValue, resetField} = useFormContext<SccFormData>();
  const [isActionSelected, setIsActionSelected] = useState(false);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const contracts = getValues('contracts') || [];
  const autoSelectedContract = contracts.length === 1 ? contracts[0] : null;

  const handleInteractOutside = () => {
    // Do nothing when interacting outside the modal
  };

  useEffect(() => {
    setValue('selectedSC', autoSelectedContract);
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
                onActionSelected={() => setIsActionSelected(true)}
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
                  iconRight={<IconFeedback height={13} width={13} />}
                  href={t('scc.listContracts.learnLinkURL')}
                  label={t('scc.listContracts.learnLinkLabel')}
                  className="justify-center mt-2 w-full"
                />
              </div>
            </>
          )}
        </Aside>

        <Main>
          {selectedSC && isActionSelected ? (
            <InputForm
              actionIndex={props.actionIndex}
              onComposeButtonClicked={props.onComposeButtonClicked}
            />
          ) : (
            <DesktopModalEmptyState />
          )}
        </Main>
      </Wrapper>
    </StyledModal>
  );
};

export default DesktopModal;

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
    'flex flex-col justify-between overflow-auto p-3 w-40 bg-ui-50 border-r border-ui-100',
})``;

const Main = styled.div.attrs({
  className: 'overflow-auto flex-1',
})``;

const Container = styled.div.attrs({
  className: 'flex h-full bg-ui-0 p-6 pt-0 justify-center items-center',
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
