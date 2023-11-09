import React from 'react';
import styled from 'styled-components';
import {Label} from '../../@aragon/ods-old';
import {useTranslation} from 'react-i18next';

const AddCommitteeWalletsHeader: React.FC = () => {
  const {t} = useTranslation();

  return (
    <Container>
      <HeaderItem>
        <Label label={t('labels.whitelistWallets.address')} />
      </HeaderItem>
    </Container>
  );
};

export default AddCommitteeWalletsHeader;

const Container = styled.div.attrs({
  className: 'hidden tablet:flex p-2 space-x-2 bg-ui-0',
})``;

const HeaderItem = styled.div.attrs({
  className: 'flex-1',
})``;
