import {Controller, useFormContext} from 'react-hook-form';
import {useFormStep} from '../../components/fullScreenStepper';
import {useGlobalModalContext} from '../../context/globalModals';
import {useTranslation} from 'react-i18next';
import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {Link} from '@aragon/ods-old';
import React from 'react';
import CommitteeAddressesModal from '../committeeAddressesModal';
import {MultisigWalletField} from 'components/multisigWallets/row';

const Committee = () => {
  const {control, getValues} = useFormContext();
  const {setStep} = useFormStep();
  const {t} = useTranslation();

  const {
    reviewCheckError,
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
          title={t('label.executionMultisig')}
          onEditClick={() => setStep(6)}
          checkBoxErrorMessage={t('createDAO.review.acceptContent')}
          checkedState={
            value ? 'active' : reviewCheckError ? 'error' : 'default'
          }
          tagLabel={t('labels.changeableVote')}
          onChecked={() => onChange(!value)}
        >
          <ReviewExecutionMultisig
            committee={committee}
            committeeMinimumApproval={committeeMinimumApproval}
            executionExpirationMinutes={executionExpirationMinutes}
            executionExpirationHours={executionExpirationHours}
            executionExpirationDays={executionExpirationDays}
          />
        </DescriptionListContainer>
      )}
    />
  );
};

export type ReviewExecutionMultisigProps = {
  committee: string[] | MultisigWalletField[];
  committeeMinimumApproval: number;
  executionExpirationMinutes: number;
  executionExpirationHours: number;
  executionExpirationDays: number;
};
export const ReviewExecutionMultisig: React.FC<
  ReviewExecutionMultisigProps
> = ({
  committee,
  committeeMinimumApproval,
  executionExpirationMinutes,
  executionExpirationHours,
  executionExpirationDays,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();

  return (
    <>
      <Dl>
        <Dt>{t('labels.review.eligibleMembers')}</Dt>
        <Dd>{t('labels.multisigMembers')}</Dd>
      </Dl>
      <Dl>
        <Dt>{t('labels.members')}</Dt>
        <Dd>
          <Link
            label={t('createDAO.review.distributionLink', {
              count: committee?.length || 0,
            })}
            onClick={() => open('committeeMembers')}
          />
        </Dd>
      </Dl>
      <Dl>
        <Dt>{t('labels.minimumApproval')}</Dt>
        <Dd>
          {t('labels.review.multisigMinimumApprovals', {
            count: committeeMinimumApproval,
            total: committee?.length || 0,
          })}
        </Dd>
      </Dl>
      <Dl>
        <Dt>{t('createDao.executionMultisig.executionTitle')}</Dt>
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
      <CommitteeAddressesModal
        committee={
          committee.map(w => {
            if (typeof w === 'string') {
              return {
                address: w,
              };
            }
            return w;
          }) as MultisigWalletField[]
        }
      />
    </>
  );
};

export default Committee;
