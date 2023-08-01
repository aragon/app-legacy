import {Controller, useFormContext} from 'react-hook-form';
import {useFormStep} from '../../components/fullScreenStepper';
import {useGlobalModalContext} from '../../context/globalModals';
import {useTranslation} from 'react-i18next';
import {useNetwork} from '../../context/network';
import {
  Dd,
  DescriptionListContainer,
  Dl,
  Dt,
} from '../../components/descriptionList';
import {IconFeedback, Link, Tag} from '@aragon/ods';
import {CHAIN_METADATA} from '../../utils/constants';
import CommunityAddressesModal from '../communityAddressesModal';
import React from 'react';

const Committee = () => {
  const {control, getValues} = useFormContext();
  const {setStep} = useFormStep();
  const {open} = useGlobalModalContext();
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {
    reviewCheckError,
    isCustomToken,
    committee,
    committeeMinimumApproval,
    executionExpirationMinutes,
    executionExpirationHours,
    executionExpirationDays,
  } = getValues();

  return (
    <Controller
      name="reviewCheck.committee"
      control={control}
      defaultValue={false}
      rules={{
        required: t('errors.required.recipient'),
      }}
      render={({field: {onChange, value}}) => (
        <DescriptionListContainer
          title={'Executive committee'}
          onEditClick={() => setStep(6)}
          checkBoxErrorMessage={t('createDAO.review.acceptContent')}
          checkedState={
            value ? 'active' : reviewCheckError ? 'error' : 'default'
          }
          tagLabel={t('labels.changeableVote')}
          onChecked={() => onChange(!value)}
        >
          {/*todo(kon): intl*/}
          <Dl>
            <Dt>{t('labels.review.distribution')}</Dt>
            <Dd>
              {isCustomToken ? (
                <Link
                  label={t('createDAO.review.distributionLink', {
                    count: committee?.length,
                  })}
                  onClick={() => open('addresses')}
                />
              ) : (
                <Link
                  label={t('labels.review.distributionLinkLabel')}
                  href={
                    CHAIN_METADATA[network].explorer +
                      '/token/tokenholderchart/' +
                      committee?.address || committee
                  }
                  iconRight={<IconFeedback />}
                  external
                />
              )}
            </Dd>
          </Dl>
          {/*todo(kon): intl */}
          <Dl>
            <Dt>{t('labels.minimumApproval')}</Dt>
            <Dd>
              {committeeMinimumApproval}&nbsp;
              {t('labels.review.multisigMinimumApprovals', {
                count: committee.length,
              })}
            </Dd>
          </Dl>
          {/*todo(kon): intl*/}
          <Dl>
            <Dt>{t('labels.minimumDuration')}</Dt>
            <Dd>
              <div className="flex space-x-1.5">
                <div>
                  {t('createDAO.review.days', {days: executionExpirationDays})}
                </div>
                <div>
                  {t('createDAO.review.hours', {
                    hours: executionExpirationHours,
                  })}
                </div>
                <div>
                  {t('createDAO.review.minutes', {
                    minutes: executionExpirationMinutes,
                  })}
                </div>
              </div>
            </Dd>
          </Dl>

          {/*<CommunityAddressesModal tokenMembership={membership === 'token'} />*/}
        </DescriptionListContainer>
      )}
    />
  );
};

export default Committee;
