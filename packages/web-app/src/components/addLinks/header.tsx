import React from 'react';
import styled from 'styled-components';
import {Label} from '@aragon/ui-components';
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

export const Container = styled.div.attrs(({bgWhite}: BgWhite) => ({
  className: `hidden tablet:flex p-2 space-x-2 ${
    bgWhite ? 'bg-ui-50 border border-ui-100 rounded-t-xl' : 'bg-ui-0'
  }`,
}))<BgWhite>``;

export const HeaderItem = styled.div.attrs({
  className: 'flex-1',
})``;
