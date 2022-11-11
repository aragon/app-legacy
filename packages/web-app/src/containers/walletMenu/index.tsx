import React from 'react';
import {
  Avatar,
  ButtonIcon,
  ButtonText,
  IconClose,
  IconCopy,
  IconSwitch,
  IconTurnOff,
} from '@aragon/ui-components';
import {useGlobalModalContext} from 'context/globalModals';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

import {useWallet} from 'hooks/useWallet';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {shortenAddress} from '@aragon/ui-components/src/utils/addresses';
import {handleClipboardActions} from 'utils/library';
import useScreen from 'hooks/useScreen';
import {CHAIN_METADATA} from 'utils/constants';
import {LoginRequired} from './LoginRequired';
import {trackEvent} from 'services/analytics';
import {useAlertContext} from 'context/alert';

export const WalletMenu = () => {
  const {close, isWalletOpen} = useGlobalModalContext();
  const {
    address,
    ensName,
    ensAvatarUrl,
    methods,
    chainId,
    isConnected,
    network,
    provider,
  } = useWallet();
  const {isDesktop} = useScreen();
  const {t} = useTranslation();
  const {alert} = useAlertContext();

  const handleDisconnect = () => {
    methods
      .disconnect()
      .then(() => {
        trackEvent('wallet_disconnected', {
          network,
          wallet_address: address,
          wallet_provider: provider?.connection.url,
        });
        localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER');
        close('wallet');
      })
      .catch((e: Error) => {
        console.error(e);
      });
  };
  const handleViewTransactions = () => {
    // TODO
    // this redirects to the explorer the user selected in his
    // wallet but does not take into account the network in the
    // url, or the fact that the network of the wallet is different
    // from the one on the url, so this must be reviewed-
    const baseUrl = Object.entries(CHAIN_METADATA).filter(
      chain => chain[1].id === chainId
    )[0][1].explorer;
    window.open(baseUrl + '/address/' + address, '_blank');
  };

  if (!isConnected) return <LoginRequired />;

  return (
    <ModalBottomSheetSwitcher
      onClose={() => close('wallet')}
      isOpen={isWalletOpen}
    >
      <ModalHeader>
        <AvatarAddressContainer>
          <Avatar src={ensAvatarUrl || address || ''} size="small" />
          <AddressContainer>
            <Title>{ensName ? ensName : shortenAddress(address)}</Title>
            {ensName && <SubTitle>{shortenAddress(address)}</SubTitle>}
          </AddressContainer>
        </AvatarAddressContainer>
        <ButtonIcon
          mode="secondary"
          icon={<IconCopy />}
          size="small"
          onClick={() =>
            address ? handleClipboardActions(address, () => null, alert) : null
          }
        />
        {isDesktop && (
          <ButtonIcon
            mode="ghost"
            icon={<IconClose />}
            size="small"
            onClick={() => close('wallet')}
          />
        )}
      </ModalHeader>
      <ModalBody>
        <StyledButtonText
          size="large"
          mode="ghost"
          iconLeft={<IconSwitch />}
          label={t('labels.viewTransactions')}
          onClick={handleViewTransactions}
        />
        <StyledButtonText
          size="large"
          mode="ghost"
          iconLeft={<IconTurnOff />}
          label={t('labels.logOut')}
          onClick={handleDisconnect}
        />
      </ModalBody>
    </ModalBottomSheetSwitcher>
  );
};

const ModalHeader = styled.div.attrs({
  className: 'flex p-3 bg-ui-0 rounded-xl gap-2 sticky top-0',
})`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;
const Title = styled.div.attrs({
  className: 'flex-1 font-bold text-ui-800',
})``;
const SubTitle = styled.div.attrs({
  className: 'flex-1 font-medium text-ui-500 text-sm',
})``;
const AvatarAddressContainer = styled.div.attrs({
  className: 'flex flex-1 gap-1.5 items-center',
})``;
const AddressContainer = styled.div.attrs({
  className: 'flex flex-col',
})``;
const ModalBody = styled.div.attrs({
  className: 'flex flex-col p-3 gap-1.5',
})``;

const StyledButtonText = styled(ButtonText)`
  justify-content: flex-start;
`;
