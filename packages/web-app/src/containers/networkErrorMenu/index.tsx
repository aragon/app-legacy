import React from 'react';
import {
  Avatar,
  ButtonIcon,
  ButtonText,
  IconClose,
  IconCopy,
} from '@aragon/ui-components';
import {useGlobalModalContext} from 'context/globalModals';
import styled from 'styled-components';
import {useWallet} from 'hooks/useWallet';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {shortenAddress} from '@aragon/ui-components/src/utils/addresses';
import {handleClipboardActions} from 'utils/library';
import useScreen from 'hooks/useScreen';
import {useTranslation, Trans} from 'react-i18next';
import WalletIcon from 'public/wallet.svg';
import {useNetwork} from 'context/network';
import {useSwitchNetwork} from 'hooks/useSwitchNetwork';
import {CHAIN_METADATA} from 'utils/constants';
import {useAlertContext} from 'context/alert';

const NetworkErrorMenu = () => {
  const {isNetworkOpen, close} = useGlobalModalContext();
  const {network} = useNetwork();
  const {switchWalletNetwork} = useSwitchNetwork();
  const {address, ensName, ensAvatarUrl, provider} = useWallet();
  const {isDesktop} = useScreen();
  const {t} = useTranslation();
  const {alert} = useAlertContext();

  return (
    <ModalBottomSheetSwitcher
      onClose={() => close('network')}
      isOpen={isNetworkOpen}
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
            onClick={() => close('network')}
          />
        )}
      </ModalHeader>
      <ModalBody>
        <StyledImage src={WalletIcon} />
        <WarningContainer>
          <WarningTitle>{t('alert.wrongNetwork.title')}</WarningTitle>
          <WarningDescription>
            {/** The text inside the <Trans> component is only used as a fallback if no translation is found, but the <strong> tag will replace the <1> placeholder. */}
            <Trans
              i18nKey={'alert.wrongNetwork.description'}
              values={{network: CHAIN_METADATA[network].name}}
            >
              The action can’t be executed because you are in the wrong network.
              Change to the <strong>{network}</strong> on your wallet and try
              again.
            </Trans>
          </WarningDescription>
        </WarningContainer>
        {provider?.connection.url === 'metamask' && (
          <ButtonText
            label={t('alert.wrongNetwork.buttonLabel', {
              network: CHAIN_METADATA[network].name,
            })}
            onClick={() => {
              switchWalletNetwork();
              close('network');
            }}
            size="large"
          />
        )}
      </ModalBody>
    </ModalBottomSheetSwitcher>
  );
};

export default NetworkErrorMenu;

const ModalHeader = styled.div.attrs({
  className: 'flex p-3 bg-ui-0 rounded-xl gap-2 sticky top-0',
})`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;

export const Title = styled.div.attrs({
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

export const ModalBody = styled.div.attrs({
  className: 'flex flex-col px-3 pb-3',
})``;

export const StyledImage = styled.img.attrs({
  className: 'h-20',
})``;

export const WarningContainer = styled.div.attrs({
  className: 'flex flex-col justify-center items-center space-y-1.5 mb-3',
})``;

export const WarningTitle = styled.h2.attrs({
  className: 'text-xl font-bold text-ui-800',
})``;

const WarningDescription = styled.p.attrs({
  className: 'text-sm text-ui-500 text-center',
})``;
