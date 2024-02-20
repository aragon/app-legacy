import React from 'react';
import styled from 'styled-components';
import {Label} from '@aragon/ods-old';
import {useTranslation} from 'react-i18next';

type WalletsFooterProps = {
  totalAddresses: number;
};

const AddCommitteeWalletsFooter: React.FC<WalletsFooterProps> = ({
  totalAddresses,
}) => {
  const {t} = useTranslation();

  return (
    <Container>
      <FooterItem1>
        <Label label={t('labels.summary')} />
      </FooterItem1>
      <FooterItem1>
        <StyledLabel>
          {t('labels.whitelistWallets.totalWallets')} {totalAddresses}
        </StyledLabel>
      </FooterItem1>
    </Container>
  );
};

export default AddCommitteeWalletsFooter;

const Container = styled.div.attrs({
  className: 'hidden md:flex p-4 space-x-4 bg-neutral-0',
})``;

const FooterItem1 = styled.div.attrs({
  className: 'flex-1',
})``;

const StyledLabel = styled.p.attrs({
  className: 'font-semibold text-neutral-800 text-right',
})``;
