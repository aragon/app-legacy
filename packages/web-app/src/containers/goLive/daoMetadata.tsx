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
  const {daoLogo, daoName, daoEnsName, daoSummary, links, reviewCheckError} =
    getValues();

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
          onEditClick={() => setStep(3)}
          checkBoxErrorMessage={t('createDAO.review.acceptContent')}
          checkedState={
            value ? 'active' : reviewCheckError ? 'error' : 'default'
          }
          tagLabel={t('labels.changeableVote')}
          onChecked={() => onChange(!value)}
        >
          <Dl>
            <Dt>{t('labels.logo')}</Dt>
            <Dd>
              <AvatarDao
                {...{daoName}}
                {...(daoLogo && {src: URL.createObjectURL(daoLogo)})}
                size="small"
              />
            </Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.daoName')}</Dt>
            <Dd>{daoName}</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.daoEnsName')}</Dt>
            <Dd>{`${daoEnsName}.dao.eth`}</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.summary')}</Dt>
            <Dd>{daoSummary}</Dd>
          </Dl>
          {links[0].url !== '' && (
            <Dl>
              <Dt>{t('labels.links')}</Dt>
              <Dd>
                <div className="space-y-1.5">
                  {links.map(
                    (
                      {name, url}: {name: string; url: string},
                      index: number
                    ) => {
                      return (
                        url !== '' && (
                          <ListItemLink
                            key={index}
                            label={name}
                            href={url}
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
