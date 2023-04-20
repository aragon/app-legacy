import {
  ButtonText,
  IconLinkExternal,
  Link,
  WalletInput,
} from '@aragon/ui-components';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {CHAIN_METADATA} from 'utils/constants';

const DepositModal: React.FC = () => {
  const {t} = useTranslation();
  const {isDepositOpen, close, open} = useGlobalModalContext();
  const {daoDetails} = useDaoParam();
  const {network} = useNetwork();

  return (
    <ModalBottomSheetSwitcher
      isOpen={isDepositOpen}
      onClose={() => close('deposit')}
      title={'Deposit assets'}
      subtitle={'Send assets to the DAO treasury'}
    >
      <Container>
        {daoDetails?.ensDomain && (
          <>
            <EnsHeaderWrapper>
              <EnsTitle>ENS</EnsTitle>
              <EnsSubtitle>
                Copy the ENS or contract address below and use your wallet's
                send feature to send money to your DAO's treasury.
              </EnsSubtitle>
            </EnsHeaderWrapper>
            <WalletInput
              adornmentText={'Copy'}
              value={daoDetails?.ensDomain}
              onAdornmentClick={() => null}
            />
          </>
        )}
        <AddressHeaderWrapper>
          <EnsTitle>Contract address</EnsTitle>
        </AddressHeaderWrapper>
        <BodyWrapper>
          <WalletInput
            adornmentText={'Copy'}
            value={daoDetails?.address}
            onAdornmentClick={() => null}
          />
          <Link
            href={
              CHAIN_METADATA[network].explorer +
              '/address/' +
              daoDetails?.address
            }
            label={'View on block explorer'}
            iconRight={<IconLinkExternal />}
          />
          <ActionWrapper>
            <ButtonText
              mode="primary"
              size="large"
              label={'See all Transfers'}
            />
            <ButtonText
              mode="secondary"
              size="large"
              label={t('labels.cancel')}
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

export default DepositModal;
