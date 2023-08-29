import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {useFormStep} from 'components/fullScreenStepper';
import {CHAIN_METADATA} from 'utils/constants';
import {useNetwork} from 'context/network';

const Blockchain: React.FC = () => {
  const {control, getValues} = useFormContext();
  const {setStep} = useFormStep();
  const {network} = useNetwork();
  const {blockchain, reviewCheckError} = getValues();
  const {t} = useTranslation();

  const networkInfo = CHAIN_METADATA[network];
  const networkType = networkInfo.isTestnet
    ? t('labels.testNet')
    : t('labels.mainNet');

  return (
    <Controller
      name="reviewCheck.blockchain"
      control={control}
      defaultValue={false}
      rules={{
        required: t('errors.required.recipient'),
      }}
      render={({field: {onChange, value}}) => (
        <DescriptionListContainer
          title={t('labels.review.blockchain')}
          onEditClick={() => setStep(2)}
          checkBoxErrorMessage={t('createDAO.review.acceptContent')}
          checkedState={
            value ? 'active' : reviewCheckError ? 'error' : 'default'
          }
          tagLabel={t('labels.notChangeable')}
          onChecked={() => onChange(!value)}
        >
          <Dl>
            <Dt>{t('labels.review.network')}</Dt>
            <Dd>{networkType}</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.review.blockchain')}</Dt>
            <Dd>{blockchain.label}</Dd>
          </Dl>
        </DescriptionListContainer>
      )}
    />
  );
};

export default Blockchain;
