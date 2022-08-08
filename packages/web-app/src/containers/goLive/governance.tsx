import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {useFormStep} from 'components/fullScreenStepper';
import {DescriptionListContainer, Dl, Dt, Dd} from 'components/descriptionList';

const Governance: React.FC = () => {
  const {control, getValues} = useFormContext();
  const {setStep} = useFormStep();
  const {t} = useTranslation();
  const {
    minimumApproval,
    minimumParticipation,
    tokenTotalSupply,
    tokenSymbol,
    support,
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
          title={t('labels.review.governance')}
          onEditClick={() => setStep(5)}
          editLabel={t('settings.edit')}
          checkBoxError={reviewCheckError && !value}
          checkBoxErrorMessage={t('createDAO.review.acceptContent')}
          checkedState={value ? 'active' : 'default'}
          onChecked={() => onChange(!value)}
        >
          {membership === 'token' && (
            <Dl>
              <Dt>{t('labels.minimumApproval')}</Dt>
              <Dd>
                {minimumApproval}% (
                {Math.floor(tokenTotalSupply * (minimumApproval / 100))}{' '}
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
            <Dt>{t('labels.minimumSupport')}</Dt>
            <Dd>{support}%</Dd>
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
        </DescriptionListContainer>
      )}
    />
  );
};

export default Governance;
