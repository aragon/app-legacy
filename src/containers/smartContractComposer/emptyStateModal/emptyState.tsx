import React from 'react';
import {useTranslation} from 'react-i18next';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import ModalHeader from 'components/modalHeader';
import {EmptyState, IconType} from '@aragon/ods';
import styled from 'styled-components';

type Props = {
  isOpen: boolean;
  onConnectNew: () => void;
  onClose: () => void;
  onBackButtonClicked: () => void;
};

// not exactly sure where opening will be happen or if
// these modals will be global modals. For now, keeping
// this as a "controlled" component
const ContractEmptyState: React.FC<Props> = props => {
  const {t} = useTranslation();

  return (
    <ModalBottomSheetSwitcher isOpen={props.isOpen} onClose={props.onClose}>
      <ModalHeader
        title={t('scc.emptyState.modalTitle')}
        onClose={props.onClose}
        onBackButtonClicked={props.onBackButtonClicked}
        showCloseButton
      />
      <ModalBody>
        <EmptyState
          objectIllustration={{object: 'SMART_CONTRACT'}}
          heading={t('scc.emptyState.title')}
          description={t('scc.emptyState.description')}
          primaryButton={{
            label: t('scc.emptyState.ctaLabel'),
            onClick: () => {
              props.onConnectNew();
            },
          }}
          secondaryButton={{
            label: t('navLinks.guide'),
            href: t('scc.emptyState.learnMore'),
            iconRight: IconType.LINK_EXTERNAL,
            target: '_blank',
          }}
        />
      </ModalBody>
    </ModalBottomSheetSwitcher>
  );
};

export default ContractEmptyState;

const ModalBody = styled.div.attrs({
  className: 'flex flex-col justify-center items-center overflow-hidden',
})``;
