import React from 'react';
import {AvatarDao, ListItemLink} from '@aragon/ui-components';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {useFormStep} from 'components/fullScreenStepper';
import {DescriptionListContainer, Dl, Dt, Dd} from 'components/descriptionList';

const DaoMetadata: React.FC = () => {
  const {control, getValues} = useFormContext();
  const {setStep} = useFormStep();
  const {t} = useTranslation();
  const {daoLogo, daoName, daoSummary, links} = getValues();

  return (
    <Controller
      name="reviewCheck.daoMetadata"
      control={control}
      defaultValue={false}
      rules={{
        required: t('errors.required.recipient'),
      }}
      render={({field: {onChange, value}}) => (
        <DescriptionListContainer
          title={t('labels.review.daoMetadata')}
          onEditClick={() => setStep(2)}
          editLabel={t('settings.edit')}
          checkedState={value ? 'active' : 'default'}
          onChecked={() => onChange(!value)}
        >
          <Dl>
            <Dt>{t('labels.logo')}</Dt>
            <Dd>
              <AvatarDao
                {...{daoName}}
                {...(daoLogo && {src: URL.createObjectURL(daoLogo)})}
              />
            </Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.daoName')}</Dt>
            <Dd>{daoName}</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.summary')}</Dt>
            <Dd>{daoSummary}</Dd>
          </Dl>
          {links[0].href !== '' && (
            <Dl>
              <Dt>{t('labels.links')}</Dt>
              <Dd>
                <div className="space-y-1.5">
                  {links.map(
                    (
                      {label, href}: {label: string; href: string},
                      index: number
                    ) => {
                      return (
                        href !== '' && (
                          <ListItemLink
                            key={index}
                            {...{label, href}}
                            external
                          />
                        )
                      );
                    }
                  )}
                </div>
              </Dd>
            </Dl>
          )}
        </DescriptionListContainer>
      )}
    />
  );
};

export default DaoMetadata;
