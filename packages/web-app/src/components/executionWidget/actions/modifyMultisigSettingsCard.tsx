import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {AccordionMethod} from 'components/accordionMethod';
import {Dd, Dl, Dt} from 'components/descriptionList';
import {ActionUpdateMultisigPluginSettings} from 'utils/types';

export const ModifyMultisigSettingsCard: React.FC<{
  action: ActionUpdateMultisigPluginSettings;
}> = ({action: {inputs}}) => {
  const {t} = useTranslation();

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t('labels.updateGovernanceAction')}
      smartContractName={t('labels.aragonCore')}
      methodDescription={t('labels.updateGovernanceActionDescription')}
      verified
    >
      <Container>
        <Dl>
          <Dt>{t('labels.minimumApproval')}</Dt>
          <Dd>{inputs.minApprovals}</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.proposalCreation')}</Dt>
          <Dd>
            {inputs.onlyListed
              ? t('createDAO.step3.multisigMembers')
              : t('createDAO.step3.eligibility.anyone.title')}
          </Dd>
        </Dl>
      </Container>
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className:
    'bg-ui-50 rounded-b-xl border border-t-0 border-ui-100 space-y-3 p-3',
})``;
