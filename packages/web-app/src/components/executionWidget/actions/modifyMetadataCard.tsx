import {AvatarDao, ListItemLink} from '@aragon/ui-components';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';

import {AccordionMethod} from 'components/accordionMethod';
import {ActionCardDlContainer, Dd, Dl, Dt} from 'components/descriptionList';
import {resolveDaoAvatarIpfsCid} from 'utils/library';
import {ActionUpdateMetadata} from 'utils/types';

export const ModifyMetadataCard: React.FC<{action: ActionUpdateMetadata}> = ({
  action: {inputs},
}) => {
  const {t} = useTranslation();

  const displayedLinks = inputs.links.filter(
    l => l.url !== '' && l.name !== ''
  );

  const avatar = useMemo(() => {
    if (typeof inputs.avatar === 'string')
      return resolveDaoAvatarIpfsCid(inputs.avatar);

    try {
      return URL.createObjectURL(inputs.avatar as unknown as Blob);
    } catch (err) {
      console.error(err);
    }
  }, [inputs.avatar]);

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t('labels.updateMetadataAction')}
      smartContractName={t('labels.aragonOSx')}
      methodDescription={t('labels.updateMetadataActionDescription')}
      verified
    >
      <ActionCardDlContainer>
        <Dl>
          <Dt>{t('labels.logo')}</Dt>
          <Dd>
            <AvatarDao daoName={inputs.name} src={avatar} size="small" />
          </Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.name')}</Dt>
          <Dd>{inputs.name}</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.description')}</Dt>
          <Dd>{inputs.description}</Dd>
        </Dl>
        {displayedLinks.length > 0 && (
          <Dl>
            <Dt>{t('labels.links')}</Dt>
            <Dd>
              {displayedLinks.map(link => (
                <ListItemLink
                  key={link.url}
                  label={link.name}
                  href={link.url}
                />
              ))}
            </Dd>
          </Dl>
        )}
      </ActionCardDlContainer>
    </AccordionMethod>
  );
};
