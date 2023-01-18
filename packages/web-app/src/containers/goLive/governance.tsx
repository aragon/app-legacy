import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {useFormStep} from 'components/fullScreenStepper';

const Governance: React.FC = () => {
  const {control, getValues} = useFormContext();
  const {setStep} = useFormStep();
  const {t} = useTranslation();
  const {
    minimumApproval,
    minimumParticipation,
    tokenTotalSupply,
    tokenSymbol,
    durationMinutes,
    durationHours,
    durationDays,
    membership,
    whitelistWallets,
    reviewCheckError,
  } = getValues();

  return (
    <Controller
      name="reviewCheck.governance"
      control={control}
      defaultValue={false}
      rules={{
        required: t('errors.required.recipient'),
      }}
      render={({field: {onChange, value}}) => (
        <DescriptionListContainer
          title={t('labels.review.votingParameters')}
          onEditClick={() => setStep(5)}
          editLabel={t('settings.edit')}
          checkBoxErrorMessage={t('createDAO.review.acceptContent')}
          checkedState={
            value ? 'active' : reviewCheckError ? 'error' : 'default'
          }
          tagLabel={t('labels.changeableVote')}
          onChecked={() => onChange(!value)}
        >
          {membership === 'token' && (
            <Dl>
              <Dt>{t('labels.minimumParticipation')}</Dt>
              <Dd>
                {minimumParticipation}% (
                {Math.floor(tokenTotalSupply * (minimumParticipation / 100))}{' '}
                {tokenSymbol})
              </Dd>
            </Dl>
          )}
          {membership === 'wallet' && (
            <Dl>
              <Dt>{t('labels.minimumParticipation')}</Dt>
              <Dd>
                {t('labels.review.minimumParticipation', {
                  walletCount: Math.ceil(
                    (minimumParticipation * whitelistWallets.length) / 100
                  ),
                })}
              </Dd>
            </Dl>
          )}
          <Dl>
            <Dt>{t('labels.minimumApproval')}</Dt>
            <Dd>{parseInt(minimumApproval)}%</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.minimumDuration')}</Dt>
            <Dd>
              <div className="flex space-x-1.5">
                <div>{t('createDAO.review.days', {days: durationDays})}</div>
                <div>{t('createDAO.review.hours', {hours: durationHours})}</div>
                <div>
                  {t('createDAO.review.minutes', {minutes: durationMinutes})}
                </div>
              </div>
            </Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.earlyExecution')}</Dt>
            <Dd>{t('labels.yes')}</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.voteReplacement')}</Dt>
            <Dd>{t('labels.no')}</Dd>
          </Dl>
        </DescriptionListContainer>
      )}
    />
  );
};

export default Governance;
