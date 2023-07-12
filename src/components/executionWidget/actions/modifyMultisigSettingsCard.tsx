import React from 'react';
import {useTranslation} from 'react-i18next';

import {AccordionMethod} from 'components/accordionMethod';
import {ActionCardDlContainer, Dd, Dl, Dt} from 'components/descriptionList';
import {ActionUpdateMultisigPluginSettings} from 'utils/types';

export const ModifyMultisigSettingsCard: React.FC<{
  action: ActionUpdateMultisigPluginSettings;
}> = ({action: {inputs}}) => {
  const {t} = useTranslation();

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t('labels.updateGovernanceAction')}
      smartContractName={t('labels.aragonOSx')}
      methodDescription={t('labels.updateGovernanceActionDescription')}
      verified
    >
      <ActionCardDlContainer>
        <Dl>
          <Dt>{t('labels.minimumApproval')}</Dt>
          <Dd>{inputs.minApprovals}</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.proposalCreation')}</Dt>
          <Dd>
            {inputs.onlyListed
              ? t('createDAO.step3.multisigMembers')
              : t('createDAO.step3.eligibility.anyWallet.title')}
          </Dd>
        </Dl>
      </ActionCardDlContainer>
    </AccordionMethod>
  );
};
