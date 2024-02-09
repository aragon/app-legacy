import React, {useMemo} from 'react';
import {ListItemAction} from '@aragon/ods-old';
import {AlertInline, Icon, IconType} from '@aragon/ods';
import {SessionTypes, SignClientTypes} from '@walletconnect/types';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {parseWCIconUrl} from 'utils/library';
import {useWalletConnectContext} from '../walletConnectProvider';
import ModalHeader from 'components/modalHeader';
import useScreen from 'hooks/useScreen';
import {htmlIn} from 'utils/htmlIn';
import {featureFlags} from 'utils/featureFlags';

type Props = {
  onConnectNewdApp: (dApp: AllowListDApp) => void;
  onSelectExistingdApp: (
    session: SessionTypes.Struct,
    dApp: AllowListDApp
  ) => void;
  onClose: () => void;
  isOpen: boolean;
};

export type AllowListDApp = SignClientTypes.Metadata & {shortName?: string};

export const AllowListDApps: AllowListDApp[] = [
  {
    name: 'CoW Swap | The smartest way to trade cryptocurrencies',
    shortName: 'CoW Swap',
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

export const enableConnectAnyDApp =
  featureFlags.getValue('VITE_FEATURE_FLAG_CONNECT_ANY_DAPP') === 'true';

if (enableConnectAnyDApp) {
  AllowListDApps.push({
    name: 'Connect any app',
    shortName: 'Connect any app',
    description: 'Connect any app',
    url: '',
    icons: [],
  });
}

const SelectWCApp: React.FC<Props> = props => {
  const {t} = useTranslation();
  const {isDesktop} = useScreen();
  const {onConnectNewdApp, onSelectExistingdApp, onClose, isOpen} = props;

  const {sessions} = useWalletConnectContext();

  const dAppList: AllowListDApp[] = useMemo(
    () =>
      enableConnectAnyDApp
        ? [...AllowListDApps, ...sessions.map(session => session.peer.metadata)]
        : AllowListDApps,
    [sessions]
  );

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
        <div className="space-y-2">
          {dAppList.map(dApp => {
            const dAppName = dApp.shortName || dApp.name;
            const filteredSession = sessions.filter(session =>
              session.peer.metadata.name
                .toLowerCase()
                .includes(dApp.name.toLowerCase())
            );
            return (
              <ListItemAction
                key={dAppName}
                title={dAppName}
                iconLeft={parseWCIconUrl(dApp.url, dApp.icons[0])}
                bgWhite
                iconRight={
                  <div className="flex space-x-4">
                    {filteredSession[0] && (
                      <div className="flex items-center space-x-2 text-sm font-semibold leading-normal text-success-700">
                        <div className="h-2 w-2 rounded-full bg-success-700" />
                        <p>{t('modal.dappConnect.dAppConnectedLabel')}</p>
                      </div>
                    )}
                    <Icon icon={IconType.CHEVRON_RIGHT} />
                  </div>
                }
                truncateText
                onClick={() => {
                  if (filteredSession[0]) {
                    onSelectExistingdApp(filteredSession[0], dApp);
                  } else {
                    onConnectNewdApp(dApp);
                  }
                }}
              />
            );
          })}
        </div>
        <div className="mt-4 flex justify-center">
          <AlertInline
            message={t('modal.dappConnect.alertInfo')}
            variant="info"
          />
        </div>
      </Content>
    </ModalBottomSheetSwitcher>
  );
};

export default SelectWCApp;

const Content = styled.div.attrs({
  className: 'py-6 px-4 xl:px-6',
})``;
