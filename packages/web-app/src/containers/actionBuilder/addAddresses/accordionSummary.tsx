import {IconLinkExternal, Link} from '@aragon/ui-components';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useParams} from 'react-router-dom';
import styled from 'styled-components';

import {AccordionMethodType, AccordionType} from 'components/accordionMethod';
import {useNetwork} from 'context/network';
import {Community} from 'utils/paths';

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
  const {dao} = useParams();
  const {network} = useNetwork();

  // get protocol and domain, add generated path
  const membersHref = useMemo(
    () =>
      window.location.href
        .split('#')[0]
        .concat(`#${generatePath(Community, {dao, network})}`),
    [dao, network]
  );

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
            href={membersHref}
            label={t('labels.seeCommunity')}
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
