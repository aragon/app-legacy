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
          <div className="py-1.5 px-2 bg-white rounded-xl">
            <div className="flex space-x-1.5">
              <Logo src={CHAIN_METADATA[network].logo} />
              <p className="flex-1 font-semibold text-ui-800">
                {CHAIN_METADATA[network].name}
              </p>
              {status === 'connected' && !isOnWrongNetwork ? (
                <AlertInline label="Connected" mode="success" />
              ) : (
                <button
                  className="font-semibold text-primary-500"
                  onClick={() => {
                    close('deposit');
                    open('network');
                  }}
                >
                  Connect
                </button>
              )}
            </div>
          </div>
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

        <ActionWrapper>
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
        </ActionWrapper>
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

const ActionWrapper = styled.div.attrs({
  className: 'flex space-x-1.5',
})``;

const Logo = styled.img.attrs({className: 'w-3 h-3 rounded-full'})``;

export default DepositModal;
