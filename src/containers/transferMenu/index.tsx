import React from 'react';
import {ListItemAction} from '@aragon/ods-old';
import {Icon, IconType} from '@aragon/ods';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {NewWithDraw} from 'utils/paths';

type Action = 'deposit_assets' | 'withdraw_assets';

const TransferMenu: React.FC = () => {
  const {isOpen, close, open} = useGlobalModalContext('transfer');
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {dao} = useParams();
  const navigate = useNavigate();

  const handleClick = (action: Action) => {
    if (action === 'deposit_assets') {
      open('deposit');
    } else {
      navigate(generatePath(NewWithDraw, {network: network, dao: dao}));
      close();
    }
  };

  return (
    <ModalBottomSheetSwitcher
      isOpen={isOpen}
      onClose={close}
      title={t('TransferModal.newTransfer')}
    >
      <Container>
        <ListItemAction
          title={t('modal.deposit.headerTitle')}
          subtitle={t('modal.deposit.headerDescription')}
          iconRight={<Icon icon={IconType.CHEVRON_RIGHT} />}
          onClick={() => handleClick('deposit_assets')}
        />
        <ListItemAction
          title={t('TransferModal.item2Title')}
          subtitle={t('TransferModal.item2Subtitle')}
          iconRight={<Icon icon={IconType.CHEVRON_RIGHT} />}
          onClick={() => handleClick('withdraw_assets')}
        />
      </Container>
    </ModalBottomSheetSwitcher>
  );
};

export default TransferMenu;

const Container = styled.div.attrs({
  className: 'space-y-3 p-6',
})``;
