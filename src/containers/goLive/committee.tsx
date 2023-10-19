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
import {IconFeedback, Link} from '@aragon/ods-old';
import {CHAIN_METADATA} from '../../utils/constants';
import React from 'react';
import CommitteeAddressesModal from '../committeeAddressesModal';

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
    tokenAddress,
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
          title={t('createDAO.review.executiveCommittee')}
          onEditClick={() => setStep(6)}
          checkBoxErrorMessage={t('createDAO.review.acceptContent')}
          checkedState={
            value ? 'active' : reviewCheckError ? 'error' : 'default'
          }
          tagLabel={t('labels.changeableVote')}
          onChecked={() => onChange(!value)}
        >
          <Dl>
            <Dt>{t('labels.review.eligableMembers')}</Dt>
            <Dd>
              {isCustomToken
                ? t('createDAO.step3.tokenMembership')
                : t('createDAO.step3.multisigMembership')}
            </Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.review.members')}</Dt>
            <Dd>
              {isCustomToken ? (
                <Link
                  label={t('createDAO.review.distributionLink', {
                    count: committee?.length,
                  })}
                  onClick={() => open('committeeMembers')}
                />
              ) : (
                <Link
                  label={t('labels.review.distributionLinkLabel')}
                  href={
                    CHAIN_METADATA[network].explorer +
                      '/token/tokenholderchart/' +
                      tokenAddress?.address || committee
                  }
                  iconRight={<IconFeedback />}
                  external
                />
              )}
            </Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.minimumApproval')}</Dt>
            <Dd>
              {t('labels.review.multisigMinimumApprovals', {
                count: committeeMinimumApproval,
                total: committee.length,
              })}
            </Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.minimumDuration')}</Dt>
            <Dd>
              <div className="flex space-x-1.5">
                <div>
                  {t('createDAO.review.days', {days: executionExpirationDays})}
                </div>
                {executionExpirationHours > 0 && (
                  <div>
                    {t('createDAO.review.hours', {
                      hours: executionExpirationHours,
                    })}
                  </div>
                )}
                {executionExpirationMinutes > 0 && (
                  <div>
                    {t('createDAO.review.minutes', {
                      minutes: executionExpirationMinutes,
                    })}
                  </div>
                )}
              </div>
            </Dd>
          </Dl>

          <CommitteeAddressesModal />
        </DescriptionListContainer>
      )}
    />
  );
};

export default Committee;
