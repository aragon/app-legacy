import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {StateEmpty} from 'components/stateEmpty';
import React from 'react';
import ModalHeader from '../components/modalHeader';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {trackEvent} from 'services/analytics';
import {useParams} from 'react-router-dom';
import {IconFeedback, Link} from '@aragon/ui-components';

type Props = {
  isOpen: boolean;
  onConnectNew: () => void;
  onClose: () => void;
  onBackButtonClicked: () => void;
};

// not exactly sure where opening will be happen or if
// these modals will be global modals. For now, keeping
// this as a "controlled" component
const EmptyState: React.FC<Props> = props => {
  const {t} = useTranslation();
  const {dao: daoAddressOrEns} = useParams();

  return (
    <ModalBottomSheetSwitcher isOpen={props.isOpen} onClose={props.onClose}>
      <ModalHeader
        title={t('scc.emptyState.modalTitle')}
        onClose={props.onClose}
        onBackButtonClicked={props.onBackButtonClicked}
      />
      <Content>
        <StateEmpty
          mode="inline"
          type="Object"
          object="smart_contract"
          title={t('scc.emptyState.title')}
          description={t('scc.emptyState.description')}
          primaryButton={{
            label: t('scc.emptyState.ctaLabel'),
            onClick: () => {
              trackEvent('newProposal_connectSmartContract_clicked', {
                dao_address: daoAddressOrEns,
              });
              props.onConnectNew();
            },
          }}
        />
      </Content>
    </ModalBottomSheetSwitcher>
  );
};

export default EmptyState;

const Content = styled.div.attrs({className: 'px-2 tablet:px-3 pb-3'})``;
