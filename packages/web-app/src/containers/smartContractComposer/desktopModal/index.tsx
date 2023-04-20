import {ButtonText, IconMenuVertical, Modal} from '@aragon/ui-components';
import React from 'react';
import {useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {StateEmpty} from 'components/stateEmpty';
import {SmartContract, SmartContractAction} from 'utils/types';
import ActionListGroup from '../components/actionListGroup';
import {ListItemContract} from '../components/listItemContract';
import SmartContractListGroup from '../components/smartContractListGroup';
import Header from './header';

type DesktopModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
  onBackButtonClicked: () => void;
};

const DesktopModal: React.FC<DesktopModalProps> = props => {
  const {t} = useTranslation();
  const [selectedSC, selectedAction]: [SmartContract, SmartContractAction] =
    useWatch({
      name: ['selectedSC', 'selectedAction'],
    });

  return (
    <StyledModal isOpen={props.isOpen} onClose={props.onClose}>
      <Header onClose={props.onClose} selectedContract={selectedSC?.name} />
      <Wrapper>
        <Aside>
          {selectedSC ? (
            <>
              <ListItemContract
                key={selectedSC.address}
                title={selectedSC.name}
                subtitle={`${selectedSC.actions.length} Actions to compose`}
                logo={selectedSC.logo}
                bgWhite
                iconRight={<IconMenuVertical />}
              />
              <ActionListGroup
                actions={selectedSC.actions.filter(
                  a =>
                    a.type === 'function' &&
                    (a.stateMutability === 'payable' ||
                      a.stateMutability === 'nonpayable')
                )}
              />
            </>
          ) : (
            <>
              <SmartContractListGroup />
              <ButtonText
                mode="secondary"
                size="large"
                label={t('scc.labels.connect')}
                onClick={props.onConnect}
                className="w-full"
              />
            </>
          )}
        </Aside>

        <Main>
          {selectedSC ? (
            selectedAction && (
              <div className="p-6 h-full bg-white">
                TBD: Form to collect inputs for {selectedAction.name} function
              </div>
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
