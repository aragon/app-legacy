import {IconChevronRight, ListItemAction} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useWallet} from 'hooks/useWallet';
import {trackEvent} from 'services/analytics';
import {NewDeposit, NewWithDraw} from 'utils/paths';

type Action = 'deposit_assets' | 'withdraw_assets';

const TransferMenu: React.FC = () => {
  const {isTransferOpen, close, open} = useGlobalModalContext();
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {dao} = useParams();
  const navigate = useNavigate();
  const {isConnected} = useWallet();

  const handleClick = (action: Action) => {
    trackEvent('newTransfer_modalBtn_clicked', {
      dao_address: dao,
      action,
    });

    if (!isConnected) {
      open('wallet');
    } else if (action === 'deposit_assets') {
      navigate(generatePath(NewDeposit, {network: network, dao: dao}));
    } else {
      navigate(generatePath(NewWithDraw, {network: network, dao: dao}));
    }
    close('default');
  };

  return (
    <ModalBottomSheetSwitcher
      isOpen={isTransferOpen}
      onClose={() => close('default')}
      title={t('TransferModal.newTransfer') as string}
    >
      <Container>
        <ListItemAction
          title={t('TransferModal.item1Title') as string}
          subtitle={t('TransferModal.item1Subtitle') as string}
          iconRight={<IconChevronRight />}
          onClick={() => handleClick('deposit_assets')}
        />
        <ListItemAction
          title={t('TransferModal.item2Title') as string}
          subtitle={t('TransferModal.item2Subtitle') as string}
          iconRight={<IconChevronRight />}
          onClick={() => handleClick('withdraw_assets')}
        />
      </Container>
    </ModalBottomSheetSwitcher>
  );
};

export default TransferMenu;

const Container = styled.div.attrs({
  className: 'space-y-1.5 p-3',
})``;
