import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import WalletConnectSVG from 'public/walletConnect.svg';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import ModalHeader from 'components/modalHeader';
import {StateEmpty} from 'components/stateEmpty';
import useScreen from 'hooks/useScreen';
import {htmlIn} from 'utils/htmlIn';

type Props = {
  onBackButtonClicked: () => void;
  onClose: () => void;
  onCtaClicked: () => void;
  isOpen: boolean;
};

const EmptyState: React.FC<Props> = props => {
  const {t} = useTranslation();
  const {isDesktop} = useScreen();

  return (
    <ModalBottomSheetSwitcher isOpen={props.isOpen} onClose={props.onClose}>
      <ModalHeader
        title={t('wc.emptyState.modalTitle')}
        showBackButton
        onBackButtonClicked={props.onBackButtonClicked}
        {...(isDesktop ? {showCloseButton: true, onClose: props.onClose} : {})}
      />
      <Content>
        <StateEmpty
          type="custom"
          src={WalletConnectSVG}
          mode="inline"
          title={t('wc.emptyState.title')}
          description={htmlIn(t)('wc.emptyState.desc')}
          renderHtml
          primaryButton={{
            label: t('wc.emptyState.ctaLabel'),
            onClick: props.onCtaClicked,
          }}
        />
      </Content>
    </ModalBottomSheetSwitcher>
  );
};

export default EmptyState;

const Content = styled.div.attrs({
  className: 'px-2 tablet:px-3 pb-3',
})``;
