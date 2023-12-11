import React from 'react';
import {useTranslation} from 'react-i18next';

import {AccordionMethod} from 'components/accordionMethod';
import {ActionCardDlContainer, Dd, Dl, Dt} from 'components/descriptionList';
import {
  ActionUpdateGaslessSettings,
  ActionUpdateMultisigPluginSettings,
} from 'utils/types';
import {Link} from '../../../@aragon/ods-old';
import CommitteeAddressesModal from '../../../containers/committeeAddressesModal';
import {getDHMFromSeconds} from '../../../utils/date';

export const ModifyGaslessSettingsCard: React.FC<{
  action: ActionUpdateGaslessSettings;
}> = ({action: {inputs}}) => {
  const {t} = useTranslation();
  const {days, hours, minutes} = getDHMFromSeconds(inputs.minDuration);

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t('labels.updateExecutionMultisigAction')}
      smartContractName={t('labels.aragonOSx')}
      methodDescription={t('labels.updateExecutionMultisigActionDescription')}
      verified
    >
      <ActionCardDlContainer>
        <Dl>
          <Dt>{t('labels.minimumApproval')}</Dt>
          <Dd>
            {inputs.minTallyApprovals}&nbsp;
            {t('labels.review.multisigMinimumApprovals', {
              count: inputs.executionMultisigMembers?.length || 0,
            })}
          </Dd>
        </Dl>
        <Dl>
          <Dt>{t('createDao.executionMultisig.executionTitle')}</Dt>
          <Dd>
            <div className="flex space-x-1.5">
              <div>{t('createDAO.review.days', {days: days})}</div>
              {hours && hours! > 0 && (
                <div>
                  {t('createDAO.review.hours', {
                    hours: hours,
                  })}
                </div>
              )}
              {minutes && minutes! > 0 && (
                <div>
                  {t('createDAO.review.minutes', {
                    minutes: minutes,
                  })}
                </div>
              )}
            </div>
          </Dd>
        </Dl>
      </ActionCardDlContainer>
    </AccordionMethod>
  );
};
