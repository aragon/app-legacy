import {AlertInline, ButtonText, WalletInput} from '@aragon/ui-components';
import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {CHAIN_METADATA} from 'utils/constants';
import {toDisplayEns} from 'utils/library';
import {AllTransfers} from 'utils/paths';
import {useWallet} from 'hooks/useWallet';

const DepositModal: React.FC = () => {
  const {t} = useTranslation();
  const {isDepositOpen, open, close} = useGlobalModalContext();
  const {data: daoDetails} = useDaoDetailsQuery();
  const {network} = useNetwork();
  const navigate = useNavigate();
  const {status, isOnWrongNetwork} = useWallet();

  const handleCtaClicked = useCallback(() => {
    close('deposit');
    navigate(
      generatePath(AllTransfers, {
        network,
        dao: toDisplayEns(daoDetails?.ensDomain) || daoDetails?.address,
      })
    );
  }, [close, daoDetails?.address, daoDetails?.ensDomain, navigate, network]);

  if (!daoDetails) return null;

  return (
    <ModalBottomSheetSwitcher
      isOpen={isDepositOpen}
      onClose={() => close('deposit')}
      title={t('modal.deposit.headerTitle')}
      subtitle={t('modal.deposit.headerDescription')}
    >
      <Container>
        <div>
          <Title>Blockchain</Title>
          <Subtitle>
            Use the appropriate blockchain. Funds cannot be restored once they
            have been sent.
          </Subtitle>
          <NetworkDetailsWrapper>
            <HStack>
              <Logo src={CHAIN_METADATA[network].logo} />
              <NetworkName>{CHAIN_METADATA[network].name}</NetworkName>
              {status === 'connected' && !isOnWrongNetwork ? (
                <AlertInline label="Connected" mode="success" />
              ) : (
                <ConnectButton
                  onClick={() => {
                    close('deposit');
                    open('network');
                  }}
                >
                  Connect
                </ConnectButton>
              )}
            </HStack>
          </NetworkDetailsWrapper>
        </div>

        <div>
          <Title>DAO treasury</Title>
          <Subtitle>{t('modal.deposit.inputHelptextEns')}</Subtitle>
          <WalletInput
            value={{
              ensName: daoDetails.ensDomain,
              address: daoDetails.address,
            }}
            onValueChange={() => {}}
            blockExplorerURL={CHAIN_METADATA[network].lookupURL}
            disabled
          />
        </div>

        <HStack>
          <ButtonText
            mode="primary"
            size="large"
            label={t('modal.deposit.ctaLabel')}
            onClick={handleCtaClicked}
          />
          <ButtonText
            mode="secondary"
            size="large"
            label={t('modal.deposit.cancelLabel')}
            onClick={() => close('deposit')}
          />
        </HStack>
      </Container>
    </ModalBottomSheetSwitcher>
  );
};

const Container = styled.div.attrs({
  className: 'p-3 space-y-3',
})``;

const Title = styled.h2.attrs({
  className: 'ft-text-base font-bold text-ui-800',
})``;

const Subtitle = styled.p.attrs({
  className: 'mt-0.5 text-ui-600 ft-text-sm mb-1.5',
})``;

const NetworkName = styled.p.attrs({
  className: 'flex-1 font-semibold text-ui-800',
})``;

const ConnectButton = styled.button.attrs({
  className: 'font-semibold text-primary-500',
})``;

const NetworkDetailsWrapper = styled.div.attrs({
  className: 'py-1.5 px-2 bg-white rounded-xl',
})``;

const HStack = styled.div.attrs({
  className: 'flex space-x-1.5',
})``;

const Logo = styled.img.attrs({className: 'w-3 h-3 rounded-full'})``;

export default DepositModal;
