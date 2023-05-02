import {
  ButtonText,
  IconLinkExternal,
  Link,
  WalletInput,
  shortenAddress,
} from '@aragon/ui-components';
import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useAlertContext} from 'context/alert';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {CHAIN_METADATA} from 'utils/constants';
import {toDisplayEns} from 'utils/library';
import {AllTransfers} from 'utils/paths';

const DepositModal: React.FC = () => {
  const {t} = useTranslation();
  const {isDepositOpen, close} = useGlobalModalContext();
  const {data: daoDetails} = useDaoDetailsQuery();
  const {network} = useNetwork();
  const {alert} = useAlertContext();
  const navigate = useNavigate();

  const copyToClipboard = (value: string | undefined) => {
    navigator.clipboard.writeText(value || '');
    alert(t('alert.chip.inputCopied'));
  };

  const handleCtaClicked = useCallback(() => {
    close('deposit');
    navigate(
      generatePath(AllTransfers, {
        network,
        dao: toDisplayEns(daoDetails?.ensDomain) || daoDetails?.address,
      })
    );
  }, [close, daoDetails?.address, daoDetails?.ensDomain, navigate, network]);

  const Divider: React.FC = () => {
    return (
      <DividerWrapper>
        <hr className="w-full h-px bg-ui-200" />
        <span className="px-1 font-semibold text-ui-400">
          {t('modal.deposit.dividerLabel')}
        </span>
        <hr className="w-full h-px bg-ui-200" />
      </DividerWrapper>
    );
  };

  return (
    <ModalBottomSheetSwitcher
      isOpen={isDepositOpen}
      onClose={() => close('deposit')}
      title={t('modal.deposit.headerTitle')}
      subtitle={t('modal.deposit.headerDescription')}
    >
      <Container>
        {toDisplayEns(daoDetails?.ensDomain) !== '' && (
          <>
            <EnsHeaderWrapper>
              <EnsTitle>{t('modal.deposit.inputLabelEns')}</EnsTitle>
              <EnsSubtitle>{t('modal.deposit.inputHelptextEns')}</EnsSubtitle>
            </EnsHeaderWrapper>
            <WalletInput
              adornmentText={t('labels.copy')}
              value={daoDetails?.ensDomain}
              onAdornmentClick={() => copyToClipboard(daoDetails?.ensDomain)}
              disabledFilled
            />
            <Divider />
          </>
        )}
        <AddressHeaderWrapper>
          <EnsTitle>{t('modal.deposit.inputLabelContract')}</EnsTitle>
        </AddressHeaderWrapper>
        <BodyWrapper>
          <WalletInput
            adornmentText={t('labels.copy')}
            value={shortenAddress(daoDetails?.address as string)}
            onAdornmentClick={() => copyToClipboard(daoDetails?.address)}
            disabledFilled
          />
          <Link
            href={
              CHAIN_METADATA[network].explorer +
              '/address/' +
              daoDetails?.address
            }
            label={t('modal.deposit.linkLabelBlockExplorer')}
            iconRight={<IconLinkExternal />}
          />
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
        </BodyWrapper>
      </Container>
    </ModalBottomSheetSwitcher>
  );
};

const Container = styled.div.attrs({
  className: 'p-3',
})``;

const EnsHeaderWrapper = styled.div.attrs({
  className: 'space-y-0.5 mb-1.5',
})``;

const EnsTitle = styled.h2.attrs({
  className: 'ft-text-base font-bold text-ui-800',
})``;

const EnsSubtitle = styled.p.attrs({
  className: 'text-ui-600 ft-text-sm',
})``;

const AddressHeaderWrapper = styled.div.attrs({
  className: 'mb-1',
})``;

const BodyWrapper = styled.div.attrs({
  className: 'space-y-3',
})``;

const ActionWrapper = styled.div.attrs({
  className: 'flex space-x-1.5',
})``;

const DividerWrapper = styled.div.attrs({
  className: 'flex items-center my-1',
})``;

export default DepositModal;
