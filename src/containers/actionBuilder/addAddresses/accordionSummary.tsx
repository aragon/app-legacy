import React, {useMemo} from 'react';
import {Link} from '@aragon/ods-old';
import {Icon, IconType} from '@aragon/ods';
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
  borderless?: boolean;
};

const AccordionSummary: React.FC<AccordionSummaryPropsType> = ({
  total,
  type = 'action-builder',
  IsRemove = false,
  borderless,
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
    <Footer {...{type}} className={borderless ? 'border-0' : ''}>
      <BoldedText>{t('labels.summary')}</BoldedText>
      {type === 'action-builder' ? (
        <div className="flex justify-between">
          <p className="text-neutral-600 ft-text-base">
            {t('labels.totalWallets')}
          </p>
          <BoldedText>{total}</BoldedText>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between">
            {IsRemove ? (
              <>
                <p className="text-neutral-600 ft-text-base">
                  {t('labels.removedMembers')}
                </p>
                <BoldedText>-{total}</BoldedText>
              </>
            ) : (
              <>
                <p className="text-neutral-600 ft-text-base">
                  {t('labels.addedMembers')}
                </p>
                <BoldedText>+{total}</BoldedText>
              </>
            )}
          </div>
          <Link
            href={membersHref}
            label={t('labels.seeCommunity')}
            iconRight={<Icon icon={IconType.LINK_EXTERNAL} />}
          />
        </div>
      )}
    </Footer>
  );
};

const Footer = styled.div.attrs<{type: AccordionType}>(({type}) => ({
  className: `space-y-3 bg-neutral-0 rounded-b-xl border border-t-0 border-neutral-100 ${
    type === 'action-builder' ? 'bg-neutral-0 p-6' : 'bg-neutral-50 p-4'
  }`,
}))<{type: AccordionType}>``;

const BoldedText = styled.span.attrs({
  className: 'font-semibold text-neutral-800 ft-text-base',
})``;

export default AccordionSummary;
