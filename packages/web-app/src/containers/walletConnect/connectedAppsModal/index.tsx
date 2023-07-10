import React, {useState} from 'react';
import styled from 'styled-components';
import {SessionTypes} from '@walletconnect/types';
import {
  ButtonText,
  IconChevronRight,
  IconFeedback,
  IconReload,
  IconSearch,
  Link,
  ListItemAction,
} from '@aragon/ui-components';
import {useTranslation} from 'react-i18next';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import Header from 'containers/smartContractComposer/desktopModal/header';
import {StateEmpty} from 'components/stateEmpty';

type Props = {
  sessions: Record<string, SessionTypes.Struct> | undefined;
  onConnectNewdApp: () => void;
  onSelectExistingdApp: (session: SessionTypes.Struct) => void;
  onClose: () => void;
  isOpen: boolean;
};

const WCConnectedApps: React.FC<Props> = props => {
  const [search, setSearch] = useState('');
  const {t} = useTranslation();

  let filteredSessions: Array<SessionTypes.Struct> = [];

  if (props.sessions) {
    filteredSessions = Object.values(props.sessions).filter(session =>
      session.peer.metadata.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  const handleResetSearch = () => setSearch('');
  /*************************************************
   *                     Render                    *
   *************************************************/
  return (
    <ModalBottomSheetSwitcher isOpen={props.isOpen} onClose={props.onClose}>
      <Header
        onClose={props.onClose}
        onSearch={setSearch}
        buttonIcon={search ? <IconSearch /> : undefined}
      />
      <Content>
        {props.sessions !== undefined && filteredSessions.length === 0 ? (
          <StateEmpty
            mode="inline"
            type="Object"
            object="magnifying_glass"
            title={t('wc.listdApps.emptyStateSearch.title')}
            description={t('wc.listdApps.emptyStateSearch.desc')}
            secondaryButton={{
              label: t('wc.listdApps.emptyStateSearch.ctaLabel'),
              onClick: handleResetSearch,
              iconLeft: <IconReload />,
              className: 'w-full',
              bgWhite: false,
            }}
          />
        ) : (
          <>
            <div className="space-y-1">
              <p className="text-sm font-bold text-ui-400">
                {search
                  ? t('wc.listdApps.pretitle.searchResults', {
                      amount: filteredSessions.length,
                    })
                  : t('wc.listdApps.listTitle', {
                      amount: filteredSessions.length,
                    })}
              </p>
              {filteredSessions.map(session => (
                <ListItemAction
                  key={session.topic}
                  title={session.peer.metadata.name}
                  subtitle={session.peer.metadata.description}
                  iconLeft={session.peer.metadata.icons[0]}
                  bgWhite
                  iconRight={<IconChevronRight />}
                  truncateText
                  onClick={() => props.onSelectExistingdApp(session)}
                />
              ))}
            </div>
            <ButtonText
              mode="secondary"
              size="large"
              label={t('wc.listdApps.ctaLabelDefault')}
              onClick={() => {
                props.onConnectNewdApp();
              }}
              className="mt-3 w-full"
            />
            <div className="mt-2 text-center">
              <Link
                label={t('wc.listdApps.learnLinkLabel')}
                href="/"
                external
                iconRight={<IconFeedback />}
              />
            </div>
          </>
        )}
      </Content>
    </ModalBottomSheetSwitcher>
  );
};

export default WCConnectedApps;

const Content = styled.div.attrs({
  className: 'py-3 px-2 desktop:px-3',
})``;
