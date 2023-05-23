import {ButtonText, IconFeedback, Link, Modal} from '@aragon/ui-components';
import React, {useState} from 'react';
import {useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {StateEmpty} from 'components/stateEmpty';
import {SmartContract} from 'utils/types';
import ActionListGroup from '../components/actionListGroup';
import SmartContractListGroup from '../components/smartContractListGroup';
import Header from './header';
import InputForm from '../components/inputForm';
import {trackEvent} from 'services/analytics';
import {useParams} from 'react-router-dom';
import {actionsFilter} from 'utils/contract';
import {ListHeaderContract} from '../components/listHeaderContract';
import {SccFormData} from '..';

type DesktopModalProps = {
  isOpen: boolean;
  actionIndex: number;
  onClose: () => void;
  onConnectNew: () => void;
  onBackButtonClicked: () => void;
  onComposeButtonClicked: () => void;
  onRemoveContract: (address: string) => void;
};

const DesktopModal: React.FC<DesktopModalProps> = props => {
  const {t} = useTranslation();
  const {dao: daoAddressOrEns} = useParams();
  const [selectedSC]: [SmartContract] = useWatch({
    name: ['selectedSC'],
  });
  const [search, setSearch] = useState('');
  const {getValues} = useFormContext<SccFormData>();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const contracts = getValues('contracts') || [];

  return (
    <StyledModal isOpen={props.isOpen} onClose={props.onClose}>
      <Header
        onClose={props.onClose}
        selectedContract={selectedSC?.name}
        onSearch={setSearch}
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
              {contracts.length !== 1 ? (
                <SmartContractListGroup />
              ) : (
                <>
                  <div>
                    <ListHeaderContract
                      key={contracts[0].address}
                      sc={contracts[0]}
                      onRemoveContract={props.onRemoveContract}
                    />
                    <ActionListGroup
                      actions={contracts[0].actions.filter(
                        actionsFilter(search)
                      )}
                    />
                  </div>
                </>
              )}
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
                className="justify-center w-full"
              />
            </>
          )}
        </Aside>

        <Main>
          {selectedSC ? (
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
