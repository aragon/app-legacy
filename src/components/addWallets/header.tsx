import React from 'react';
import styled from 'styled-components';
import {Label} from '@aragon/ods-old';
import {useTranslation} from 'react-i18next';

const AddWalletsHeader: React.FC = () => {
  const {t} = useTranslation();

  return (
    <Container>
      <HeaderItem>
        <Label label={t('labels.whitelistWallets.address')} />
      </HeaderItem>
      <div className="w-[200px]">
        <Label label={t('finance.tokens')} />
      </div>
      <div className="w-20">
        <Label label={t('finance.allocation')} />
      </div>
      <div className="w-12" />
    </Container>
  );
};

export default AddWalletsHeader;

const Container = styled.div.attrs({
  className: 'hidden md:flex p-4 space-x-4 bg-neutral-0',
})``;

const HeaderItem = styled.div.attrs({
  className: 'flex-1',
})``;
