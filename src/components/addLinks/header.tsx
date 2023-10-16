import React from 'react';
import styled from 'styled-components';
import {Label} from '@aragon/ods-old';
import {useTranslation} from 'react-i18next';

export type BgWhite = {bgWhite?: boolean};

const AddLinksHeader: React.FC<BgWhite> = ({bgWhite}) => {
  const {t} = useTranslation();

  return (
    <Container bgWhite={bgWhite}>
      <HeaderItem>
        <Label label={t('labels.label')} />
      </HeaderItem>
      <HeaderItem>
        <Label label={t('labels.link')} />
      </HeaderItem>
      <div className="w-6" />
    </Container>
  );
};

export default AddLinksHeader;

const Container = styled.div.attrs<{bgWhite: BgWhite}>(({bgWhite}) => ({
  className: `hidden md:flex p-2 space-x-2 ${
    bgWhite
      ? 'bg-neutral-50 border border-neutral-100 rounded-t-xl'
      : 'bg-neutral-0'
  }`,
}))<BgWhite>``;

const HeaderItem = styled.div.attrs({
  className: 'flex-1',
})``;
