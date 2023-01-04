import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {AccordionMethod} from 'components/accordionMethod';
import {ActionUpdatePluginSettings} from 'utils/types';
import {getDHMFromSeconds} from 'utils/date';

const ModifySettings: React.FC<{action: ActionUpdatePluginSettings}> = ({
  action: {inputs},
}) => {
  const {t} = useTranslation();
  const {days, hours, minutes} = getDHMFromSeconds(inputs.minDuration);

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t('Update Governance Settings')}
      smartContractName={t('labels.aragonCore')}
      verified
      //   methodDescription={t('AddActionModal.withdrawAssetsActionSubtitle')}
      methodDescription={t('TBD')}
    >
      <Container>
        <div>
          <Title>Minimum Participation</Title>
          <Value>{Math.round(inputs.minTurnout * 100)}% (TKN)</Value>
        </div>
        <div>
          <Title>Minimum Support</Title>
          <Value>{Math.round(inputs.minSupport * 100)}%</Value>
        </div>
        <div>
          <Title>Minimum Duration</Title>
          <Value>
            {t('governance.settings.preview', {
              days,
              hours,
              minutes,
            })}
          </Value>
        </div>
      </Container>
    </AccordionMethod>
  );
};

export default ModifySettings;

const Container = styled.div.attrs({
  className:
    'bg-ui-50 rounded-b-xl border border-t-0 border-ui-100 space-y-3 p-3',
})``;

const Title = styled.p.attrs({
  className: 'font-bold text-ui-800 mb-1',
})``;

const Value = styled.span.attrs({
  className: 'text-ui-600',
})``;
