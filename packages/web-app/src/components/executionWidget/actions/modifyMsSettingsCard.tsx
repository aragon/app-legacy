import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {AccordionMethod} from 'components/accordionMethod';
import {ActionUpdateMinimumApproval} from 'utils/types';

export const ModifyMsSettingsCard: React.FC<{
  action: ActionUpdateMinimumApproval;
}> = ({action: {inputs, summary}}) => {
  const {t} = useTranslation();

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t('labels.minimumApproval')}
      smartContractName={t('labels.aragonCore')}
      methodDescription={t('labels.minimumApprovalDescription')}
      verified
    >
      <Container>
        <div>
          <Title>{t('labels.minimumApproval')}</Title>
          <Value>
            {`${inputs.minimumApproval} of ${
              summary.totalWallets || 'unknown'
            } ${t('labels.authorisedWallets')}`}
          </Value>
        </div>
      </Container>
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className:
    'bg-ui-50 rounded-b-xl border border-t-0 border-ui-100 space-y-3 p-3',
})``;

const Title = styled.p.attrs({
  className: 'font-bold text-ui-800 mb-1',
})``;

const Value = styled.span.attrs({
  className: 'text-ui-600' as string,
})``;
