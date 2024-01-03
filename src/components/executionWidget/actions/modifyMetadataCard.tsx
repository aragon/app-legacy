import {AvatarDao, ListItemLink} from '@aragon/ods-old';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {AccordionMethod} from 'components/accordionMethod';
import {ActionCardDlContainer, Dd, Dl, Dt} from 'components/descriptionList';
import {ActionUpdateMetadata} from 'utils/types';
import {useResolveDaoAvatar} from 'hooks/useResolveDaoAvatar';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useNetwork} from 'context/network';
import {CHAIN_METADATA} from 'utils/constants';

export const ModifyMetadataCard: React.FC<{action: ActionUpdateMetadata}> = ({
  action: {inputs},
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {data: daoDetails} = useDaoDetailsQuery();

  const displayedLinks = inputs.links.filter(
    l => l.url !== '' && l.name !== ''
  );

  const {avatar} = useResolveDaoAvatar(inputs.avatar);

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t('labels.updateMetadataAction')}
      smartContractName={daoDetails?.metadata.name}
      smartContractAddress={daoDetails?.address}
      blockExplorerLink={
        daoDetails?.address
          ? `${CHAIN_METADATA[network].explorer}address/${daoDetails?.address}`
          : undefined
      }
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
