import {ButtonText, Modal} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {StateEmpty} from 'components/stateEmpty';
import SmartContractListGroup, {
  SmartContract,
} from '../components/smartContractListGroup';
import Header from './header';

type DesktopModalProps = {
  contracts: Array<SmartContract>;
  isOpen: boolean;
  onClose: () => void;
  onBackButtonClicked: () => void;
};

const DesktopModal: React.FC<DesktopModalProps> = props => {
  const {t} = useTranslation();

  return (
    <StyledModal isOpen={props.isOpen} onClose={props.onClose}>
      <Header onClose={props.onClose} selectedContract={'Uniswap Token'} />
      <Wrapper>
        <Aside>
          <SmartContractListGroup contracts={props.contracts} />
          <ButtonText
            mode="secondary"
            size="large"
            label={t('scc.labels.connect')}
            className="w-full"
          />
        </Aside>

        {/* Add steps here, replace emptyState */}
        <DesktopModalEmptyState />
      </Wrapper>
    </StyledModal>
  );
};

export default DesktopModal;

const DesktopModalEmptyState: React.FC = () => {
  const {t} = useTranslation();

  return (
    <Main>
      <StateEmpty
        mode="inline"
        type="Object"
        object="smart_contract"
        title={t('scc.selectionEmptyState.title')}
        description={t('scc.selectionEmptyState.description')}
      />
    </Main>
  );
};

const StyledModal = styled(Modal).attrs({
  style: {
    position: 'fixed',
    display: 'flex',
    flexDirection: 'column',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -60%)',
    boxShadow:
      '0px 24px 32px rgba(31, 41, 51, 0.04), 0px 16px 24px rgba(31, 41, 51, 0.04), 0px 4px 8px rgba(31, 41, 51, 0.04), 0px 0px 1px rgba(31, 41, 51, 0.04)',
    borderRadius: 12,
    width: '898px',
    height: '708px',
    outline: 'none',
    overflow: 'auto',
  },
})``;

const Wrapper = styled.div.attrs({className: 'flex flex-1'})``;

const Aside = styled.div.attrs({
  className:
    'flex flex-col justify-between p-3 w-40 bg-ui-50 border-r border-ui-100',
})``;

const Main = styled.div.attrs({
  className: 'flex flex-1 bg-ui-0 p-6 pt-0 justify-center items-center',
})``;
