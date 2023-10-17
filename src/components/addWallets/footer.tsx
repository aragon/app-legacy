import React from 'react';
import styled from 'styled-components';
import {Label} from '@aragon/ods-old';
import {useTranslation} from 'react-i18next';
import {useFormContext} from 'react-hook-form';

type WalletsFooterProps = {
  totalAddresses: number;
};

const AddWalletsFooter: React.FC<WalletsFooterProps> = ({totalAddresses}) => {
  const {t} = useTranslation();
  const {getValues} = useFormContext();
  const totalSupply = getValues('tokenTotalSupply');

  const label =
    totalAddresses === 1
      ? `${1} ${t('labels.whitelistWallets.address')}`
      : t('labels.whitelistWallets.addresses', {
          count: totalAddresses,
        });

  return (
    <Container>
      <FooterItem1>
        <Label label={label} />
      </FooterItem1>
      <FooterItem1>
        <StyledLabel>{totalSupply}</StyledLabel>
      </FooterItem1>
      <FooterItem2>
        <StyledLabel>100%</StyledLabel>
      </FooterItem2>
      <div className="w-16" />
    </Container>
  );
};

export default AddWalletsFooter;

const Container = styled.div.attrs({
  className: 'hidden md:flex p-2 space-x-2 bg-neutral-0',
})``;

const FooterItem1 = styled.div.attrs({
  className: 'flex-1',
})``;

const FooterItem2 = styled.div.attrs({
  className: 'w-16',
})``;

const StyledLabel = styled.p.attrs({
  className: 'font-semibold text-neutral-800 text-right',
})``;
