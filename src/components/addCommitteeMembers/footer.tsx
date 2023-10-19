import React from 'react';
import styled from 'styled-components';
import {Label} from '@aragon/ods-old';
import {useTranslation} from 'react-i18next';

type WalletsFooterProps = {
  totalAddresses: number;
};

const AddWalletsFooter: React.FC<WalletsFooterProps> = ({totalAddresses}) => {
  const {t} = useTranslation();

  return (
    <Container>
      <FooterItem1>
        <Label label={t('labels.summary')} />
      </FooterItem1>
      <FooterRow>
        <FooterItem1>
          <StyledLabel>{t('labels.whitelistWallets.totalWallets')}</StyledLabel>
        </FooterItem1>
        <FooterItem2>
          <StyledLabel>{totalAddresses}</StyledLabel>
        </FooterItem2>
      </FooterRow>
    </Container>
  );
};

export default AddWalletsFooter;

export const Container = styled.div.attrs({
  className: 'hidden tablet:flex tablet:flex-col p-2 bg-ui-0',
})``;

const FooterRow = styled.div.attrs({
  className: 'flex',
})``;

export const FooterItem1 = styled.div.attrs({
  className: 'flex-1',
})``;

export const FooterItem2 = styled.div.attrs({
  className: 'w-8 text-right',
})``;

const StyledLabel = styled.p.attrs({
  className: 'text-ui-800',
})``;
