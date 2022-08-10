import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {AccordionMethodType, AccordionType} from 'components/accordionMethod';
import {IconLinkExternal, Link} from '@aragon/ui-components';

type AccordionSummaryPropsType = {
  type?: AccordionMethodType['type'];
  total: number;
  IsRemove?: boolean;
};

const AccordionSummary: React.FC<AccordionSummaryPropsType> = ({
  total,
  type = 'action-builder',
  IsRemove = false,
}) => {
  const {t} = useTranslation();

  return (
    <Footer {...{type}}>
      <BoldedText>{t('labels.summary')}</BoldedText>
      {type === 'action-builder' ? (
        <div className="flex justify-between">
          <p className="text-ui-600 ft-text-base">{t('labels.totalWallets')}</p>
          <BoldedText>{total}</BoldedText>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex justify-between">
            {IsRemove ? (
              <>
                <p className="text-ui-600 ft-text-base">
                  {t('labels.removedMembers')}
                </p>
                <BoldedText>-{total}</BoldedText>
              </>
            ) : (
              <>
                <p className="text-ui-600 ft-text-base">
                  {t('labels.addedMembers')}
                </p>
                <BoldedText>+{total}</BoldedText>
              </>
            )}
          </div>
          <Link
            label={t('labels.seeCommunity')}
            external
            iconRight={<IconLinkExternal />}
          />
        </div>
      )}
    </Footer>
  );
};

const Footer = styled.div.attrs(({type}: AccordionType) => ({
  className: `space-y-1.5 bg-ui-0 rounded-b-xl border border-t-0 border-ui-100 ${
    type === 'action-builder' ? 'bg-white p-3' : 'bg-ui-50 p-2'
  }`,
}))<AccordionType>``;

const BoldedText = styled.span.attrs({
  className: 'font-bold text-ui-800 ft-text-base',
})``;

export default AccordionSummary;
