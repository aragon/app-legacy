import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const AccordionSummary: React.FC<{total: number}> = ({total}) => {
  const {t} = useTranslation();

  return (
    <Footer>
      <BoldedText>{t('labels.summary')}</BoldedText>
      <div className="flex justify-between">
        <p className="text-ui-600 ft-text-base">{t('labels.totalWallets')}</p>
        <BoldedText>{total}</BoldedText>
      </div>
    </Footer>
  );
};

const Footer = styled.div.attrs({
  className:
    'space-y-1.5 p-3 bg-ui-0 rounded-b-xl border border-t-0 border-ui-100 ',
})``;

const BoldedText = styled.span.attrs({
  className: 'font-bold text-ui-800 ft-text-base',
})``;

export default AccordionSummary;
