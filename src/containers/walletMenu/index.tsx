import React, {useEffect} from 'react';
import {Avatar} from '@aragon/ods-old';
import {Button, IconType} from '@aragon/ods';
import {useGlobalModalContext} from 'context/globalModals';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useAlertContext} from 'context/alert';
import useScreen from 'hooks/useScreen';
import {useWallet} from 'hooks/useWallet';
import {trackEvent} from 'services/analytics';
import {CHAIN_METADATA} from 'utils/constants';
import {handleClipboardActions, shortenAddress} from 'utils/library';
import {LoginRequired} from './LoginRequired';

export const WalletMenu = () => {
  const {close, isOpen} = useGlobalModalContext('wallet');
  const {
    address,
    ensName,
    ensAvatarUrl,
    methods,
    chainId,
    isConnected,
    network,
    status,
    provider,
  } = useWallet();
  const {isDesktop} = useScreen();
  const {t} = useTranslation();
  const {alert} = useAlertContext();

  useEffect(() => {
    if (status === 'connected' && !isConnected)
      alert(t('alert.chip.walletConnected'));
  }, [alert, isConnected, status, t]);

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
        close();
        alert(t('alert.chip.walletDisconnected'));
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
    <ModalBottomSheetSwitcher onClose={close} isOpen={isOpen}>
      <ModalHeader>
        <AvatarAddressContainer>
          <Avatar src={ensAvatarUrl || address || ''} size="small" />
          <AddressContainer>
            <Title>{ensName ? ensName : shortenAddress(address)}</Title>
            {ensName && <SubTitle>{shortenAddress(address)}</SubTitle>}
          </AddressContainer>
        </AvatarAddressContainer>
        <Button
          variant="tertiary"
          iconLeft={IconType.COPY}
          size="sm"
          onClick={() =>
            address ? handleClipboardActions(address, () => null, alert) : null
          }
        />
        {isDesktop && (
          <Button
            variant="tertiary"
            iconLeft={IconType.CLOSE}
            size="sm"
            onClick={() => close()}
          />
        )}
      </ModalHeader>
      <ModalBody>
        <StyledButtonText
          size="lg"
          variant="tertiary"
          iconLeft={IconType.BLOCKCHAIN_TRANSACTION}
          onClick={handleViewTransactions}
        >
          {t('labels.viewTransactions')}
        </StyledButtonText>
        <StyledButtonText
          size="lg"
          variant="tertiary"
          iconLeft={IconType.LOGOUT}
          onClick={handleDisconnect}
        >
          {t('labels.disconnectWallet')}
        </StyledButtonText>
      </ModalBody>
    </ModalBottomSheetSwitcher>
  );
};

const ModalHeader = styled.div.attrs({
  className: 'flex p-6 bg-neutral-0 rounded-xl gap-4 sticky top-0',
})`
  box-shadow:
    0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;
const Title = styled.div.attrs({
  className: 'flex-1 font-semibold text-neutral-800',
})``;
const SubTitle = styled.div.attrs({
  className: 'flex-1 font-medium text-neutral-500 text-sm leading-normal',
})``;
const AvatarAddressContainer = styled.div.attrs({
  className: 'flex flex-1 gap-3 items-center',
})``;
const AddressContainer = styled.div.attrs({
  className: 'flex flex-col',
})``;
const ModalBody = styled.div.attrs({
  className: 'flex flex-col p-6 gap-3',
})``;

const StyledButtonText = styled(Button)`
  justify-content: flex-start;
`;
