import {ButtonText, IconLinkExternal} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {useGlobalModalContext} from 'context/globalModals';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';

const PoapClaimModal: React.FC = () => {
  const {t} = useTranslation();
  const {isPoapClaimOpen, close} = useGlobalModalContext();

  return (
    <ModalBottomSheetSwitcher
      isOpen={isPoapClaimOpen}
      onClose={() => close('poapClaim')}
      title={t('modal.claimPoap.title')}
    >
      <Container>
        <BodyWrapper>
          <PoapImgContainer>
            <PoapImg
              src="https://assets.poap.xyz/aragon-dao-builder-2023-logo-1678314360270.png"
              alt=""
            />
          </PoapImgContainer>

          <ButtonText
            mode="primary"
            size="large"
            label={t('modal.claimPoap.ctaLabel')}
            className="w-full"
            iconRight={<IconLinkExternal />}
            onClick={() => {
              window.open(t('modal.claimPoap.ctaURL'), '_blank');
              close('poapClaim');
            }}
          />
        </BodyWrapper>
      </Container>
    </ModalBottomSheetSwitcher>
  );
};

const Container = styled.div.attrs({
  className: 'p-3',
})``;

const PoapImgContainer = styled.div.attrs({
  className: 'py-3 flex justify-center',
})``;

const PoapImg = styled.img`
  width: 100%;
  max-width: 280px;
  height: 100%;
  max-height: 280px;
`;

const BodyWrapper = styled.div.attrs({
  className: 'space-y-3',
})``;

export default PoapClaimModal;
