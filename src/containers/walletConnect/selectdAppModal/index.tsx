import {AlertInline, Button, Icon, IconType} from '@aragon/ods';
import {ListItemAction} from '@aragon/ods-old';
import {SessionTypes} from '@walletconnect/types';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import ModalHeader from 'components/modalHeader';
import useScreen from 'hooks/useScreen';
import {parseWCIconUrl} from 'utils/library';
import {useWalletConnectContext} from '../walletConnectProvider';
import WalletConnect from '../../../assets/images/WalletConnectIcon.svg';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConnectNewdApp: () => void;
  onBackButtonClicked: () => void;
  onSelectExistingdApp: (session: SessionTypes.Struct) => void;
};

const SelectdAppModal: React.FC<Props> = props => {
  const {
    isOpen,
    onClose,
    onConnectNewdApp,
    onBackButtonClicked,
    onSelectExistingdApp,
  } = props;

  const {t} = useTranslation();
  const {isDesktop} = useScreen();

  const {sessions} = useWalletConnectContext();

  /*************************************************
   *                     Render                    *
   *************************************************/
  return (
    <ModalBottomSheetSwitcher isOpen={isOpen} onClose={onClose}>
      <ModalHeader
        title={t('modal.dappConnect.headerTitle')}
        showBackButton
        onBackButtonClicked={onBackButtonClicked}
        {...(isDesktop ? {showCloseButton: true, onClose} : {})}
      />
      <Content>
        <div className="flex flex-col gap-3">
          <img src={WalletConnect} alt="Wallet Connect" className="h-[50px]" />
          <Description className="text-center mb-2">
            {t('modal.dappConnect.desc1')}
          </Description>
          <Description className="text-center">
            {t('modal.dappConnect.desc2')}
          </Description>
          {sessions.length > 0 && (
            <Label>{t('modal.dappConnect.detaildApp.listTitle')}</Label>
          )}
          <div className="flex flex-col gap-y-2">
            {sessions.map(session => (
              <ListItemAction
                key={session.topic}
                title={session.peer.metadata.name}
                iconLeft={parseWCIconUrl(
                  session.peer.metadata.url,
                  session.peer.metadata.icons[0]
                )}
                bgWhite
                truncateText
                onClick={() => onSelectExistingdApp(session)}
                iconRight={
                  <div className="flex gap-x-4">
                    <div className="flex items-center space-x-2 text-sm font-semibold leading-normal text-success-700">
                      <div className="h-2 w-2 rounded-full bg-success-700" />
                      <p>{t('modal.dappConnect.dAppConnectedLabel')}</p>
                    </div>
                    <Icon icon={IconType.CHEVRON_RIGHT} />
                  </div>
                }
              />
            ))}
          </div>
        </div>
        <Footer>
          <Button
            size="lg"
            className="w-full"
            onClick={onConnectNewdApp}
            variant={sessions.length > 0 ? 'secondary' : 'primary'}
          >
            {t('modal.dappConnect.detaildApp.ctaLabelConnect')}
          </Button>
          <AlertInline
            message={t('modal.dappConnect.alertInfo')}
            variant="warning"
          />
        </Footer>
      </Content>
    </ModalBottomSheetSwitcher>
  );
};

export default SelectdAppModal;

const Content = styled.div.attrs({
  className: 'py-6 px-4 xl:px-6 flex flex-col gap-y-6 justify-center',
})``;

const Description = styled.p.attrs({
  className: 'ft-text-sm text-neutral-600',
})``;

const Label = styled.p.attrs({
  className: 'ft-text-base font-semibold text-neutral-500',
})``;

const Footer = styled.div.attrs({
  className: 'flex flex-col gap-y-3 items-center',
})``;
