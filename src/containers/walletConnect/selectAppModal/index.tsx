import {AlertInline, IconChevronRight, ListItemAction} from '@aragon/ods';
import {SessionTypes, SignClientTypes} from '@walletconnect/types';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {parseWCIconUrl} from 'utils/library';
import {useWalletConnectContext} from '../walletConnectProvider';
import ModalHeader from 'components/modalHeader';
import useScreen from 'hooks/useScreen';
import {htmlIn} from 'utils/htmlIn';

type Props = {
  onConnectNewdApp: (dApp: SignClientTypes.Metadata) => void;
  onSelectExistingdApp: (session: SessionTypes.Struct) => void;
  onClose: () => void;
  isOpen: boolean;
};

const AllowListDApps: SignClientTypes.Metadata[] = [
  {
    name: 'CoW Swap | The smartest way to trade cryptocurrencies',
    description:
      'CoW Swap finds the lowest prices from all decentralized exchanges and DEX aggregators & saves you more with p2p trading and protection from MEV',
    url: 'https://swap.cow.fi',
    icons: [
      'https://swap.cow.fi/favicon.png?v=2',
      'https://swap.cow.fi/favicon.png?v=2',
      'https://swap.cow.fi/favicon.png?v=2',
    ],
  },
];

const SelectWCApp: React.FC<Props> = props => {
  const {t} = useTranslation();
  const {isDesktop} = useScreen();
  const {onConnectNewdApp, onSelectExistingdApp, onClose, isOpen} = props;

  const {activeSessions} = useWalletConnectContext();

  /*************************************************
   *                     Render                    *
   *************************************************/
  return (
    <ModalBottomSheetSwitcher isOpen={isOpen} onClose={onClose}>
      <ModalHeader
        title={t('modal.dappConnect.headerTitle')}
        subTitle={htmlIn(t)('modal.dappConnect.desc')}
        showBackButton
        onBackButtonClicked={() => {
          onClose();
        }}
        {...(isDesktop ? {showCloseButton: true, onClose} : {})}
      />
      <Content>
        <div className="space-y-1">
          {AllowListDApps.map(dApp => {
            const filteredSession = activeSessions.filter(session =>
              session.peer.metadata.name
                .toLowerCase()
                .includes(dApp.name.toLowerCase())
            );
            return (
              <ListItemAction
                key={dApp.name}
                title={dApp.name}
                iconLeft={parseWCIconUrl(dApp.url, dApp.icons[0])}
                bgWhite
                iconRight={
                  <div className="flex space-x-2">
                    {filteredSession[0] && (
                      <div className="flex items-center space-x-1 text-sm font-semibold text-success-700">
                        <div className="h-1 w-1 rounded-full bg-success-700" />
                        <p>Connected</p>
                      </div>
                    )}
                    <IconChevronRight />
                  </div>
                }
                truncateText
                onClick={() => {
                  if (filteredSession[0]) {
                    onSelectExistingdApp(filteredSession[0]);
                  } else {
                    onConnectNewdApp(dApp);
                  }
                }}
              />
            );
          })}
        </div>
        <div className="mt-2 flex justify-center">
          <AlertInline label={t('modal.dappConnect.alertInfo')} />
        </div>
      </Content>
    </ModalBottomSheetSwitcher>
  );
};

export default SelectWCApp;

const Content = styled.div.attrs({
  className: 'py-3 px-2 desktop:px-3',
})``;
