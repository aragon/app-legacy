import {
  AvatarDao,
  Badge,
  ButtonText,
  IconGovernance,
  Link,
  ListItemLink,
} from '@aragon/ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {Loading} from 'components/temporary';
import {PageWrapper} from 'components/wrappers';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {PluginTypes} from 'hooks/usePluginClient';
import {usePluginSettings} from 'hooks/usePluginSettings';
import useScreen from 'hooks/useScreen';
import {getDHMFromSeconds} from 'utils/date';
import {EditSettings} from 'utils/paths';

const Settings: React.FC = () => {
  const {data: daoId, isLoading} = useDaoParam();
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {isMobile} = useScreen();
  const {network} = useNetwork();
  const navigate = useNavigate();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetails(
    daoId!
  );
  const {data: daoSettings, isLoading: settingsAreLoading} = usePluginSettings(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes
  );

  if (isLoading || detailsAreLoading || settingsAreLoading) {
    return <Loading />;
  }

  const {days, hours, minutes} = getDHMFromSeconds(daoSettings.minDuration);

  return (
    <PageWrapper
      title={t('labels.daoSettings')}
      buttonLabel={t('settings.proposeSettings')}
      showButton={isMobile}
      buttonIcon={<IconGovernance />}
      onClick={() => navigate(generatePath(EditSettings, {network, daoId}))}
    >
      <div className="mt-3 desktop:mt-8 space-y-5">
        <DescriptionListContainer
          title={t('labels.review.blockchain')}
          badgeLabel={t('labels.notChangeable')}
        >
          <Dl>
            <Dt>{t('labels.review.network')}</Dt>
            <Dd>{t('createDAO.review.network', {network: 'Main'})}</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.review.blockchain')}</Dt>
            <Dd>{network}</Dd>
          </Dl>
        </DescriptionListContainer>

        <DescriptionListContainer title={t('labels.review.daoMetadata')}>
          <Dl>
            <Dt>{t('labels.logo')}</Dt>
            <Dd>
              <AvatarDao
                daoName={daoDetails?.ensDomain || ''}
                src={daoDetails?.metadata.avatar}
              />
            </Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.daoName')}</Dt>
            <Dd>{daoDetails?.ensDomain}</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.summary')}</Dt>
            <Dd>{daoDetails?.metadata.description}</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.links')}</Dt>
            <Dd>
              <div className="space-y-1.5">
                {daoDetails?.metadata.links.map(({name, url}) => (
                  <ListItemLink label={name} href={url} key={url} />
                ))}
              </div>
            </Dd>
          </Dl>
        </DescriptionListContainer>

        <DescriptionListContainer
          title={t('labels.review.voters')}
          badgeLabel={t('labels.notChangeable')}
        >
          <Dl>
            <Dt>{t('labels.review.eligibleVoters')}</Dt>
            <Dd>{t('createDAO.step3.tokenMembership')}</Dd>
          </Dl>
          <Dl>
            <Dt>{t('votingTerminal.token')}</Dt>
            <Dd>
              <div className="flex items-center space-x-1.5">
                <p>{t('createDAO.step3.tokenName')}</p>
                <p>TKN</p>
                <Badge label="New" colorScheme="info" />
              </div>
            </Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.supply')}</Dt>
            <Dd>
              <div className="flex items-center space-x-1.5">
                <p>1,000 TKN</p>
                <Badge label="Mintable" />
              </div>
            </Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.review.distribution')}</Dt>
            <Dd>
              <Link
                label={t('createDAO.review.distributionLink', {
                  count: 10,
                })}
                onClick={() => open('addresses')}
              />
            </Dd>
          </Dl>
        </DescriptionListContainer>

        <DescriptionListContainer title={t('labels.review.governance')}>
          <Dl>
            <Dt>{t('labels.minimumApproval')}</Dt>
            <Dd>{Math.round(daoSettings.minTurnout * 100)}% (150 TKN)</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.minimumSupport')}</Dt>
            <Dd>{Math.round(daoSettings?.minSupport * 100)}%</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.minimumDuration')}</Dt>
            <Dd>
              {t('governance.settings.preview', {
                days,
                hours,
                minutes,
              })}
            </Dd>
          </Dl>
        </DescriptionListContainer>

        <ButtonText
          label={t('settings.proposeSettings')}
          className="mx-auto mt-5 w-full tablet:w-max"
          size="large"
          iconLeft={<IconGovernance />}
          onClick={() => navigate('edit')}
        />
      </div>
    </PageWrapper>
  );
};

export default withTransaction('Settings', 'component')(Settings);
