import React from 'react';
import {withTransaction} from '@elastic/apm-rum-react';
import {
  AvatarDao,
  Badge,
  ButtonText,
  IconGovernance,
  Link,
  ListItemLink,
} from '@aragon/ui-components';
import {useTranslation} from 'react-i18next';
import {
  generatePath,
  useParams,
  Link as RouterLink,
  useNavigate,
} from 'react-router-dom';

import {PageWrapper} from 'components/wrappers';
import {DescriptionListContainer, Dl, Dt, Dd} from 'components/descriptionList';
import {useGlobalModalContext} from 'context/globalModals';
import useScreen from 'hooks/useScreen';
import {useDaoParam} from 'hooks/useDaoParam';
import {Loading} from 'components/temporary';
import {EditSettings} from 'utils/paths';
import {useNetwork} from 'context/network';

const Settings: React.FC = () => {
  const {loading} = useDaoParam();
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {isMobile} = useScreen();
  const {network} = useNetwork();
  const {dao} = useParams();
  const navigate = useNavigate();

  if (loading) {
    return <Loading />;
  }

  return (
    <PageWrapper
      title={t('labels.daoSettings')}
      buttonLabel={t('settings.proposeSettings')}
      showButton={isMobile}
      buttonIcon={<IconGovernance />}
      onClick={() => navigate(generatePath(EditSettings, {network, dao}))}
    >
      <div className="mt-3 desktop:mt-8 space-y-5">
        <DescriptionListContainer title={t('labels.review.blockchain')}>
          <Dl>
            <Dt>{t('labels.review.network')}</Dt>
            <Dd>{t('createDAO.review.network', {network: 'Main'})}</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.review.blockchain')}</Dt>
            <Dd>Arbitrum</Dd>
          </Dl>
        </DescriptionListContainer>

        <DescriptionListContainer title={t('labels.review.daoMetadata')}>
          <Dl>
            <Dt>{t('labels.logo')}</Dt>
            <Dd>
              <AvatarDao daoName="Aragon" />
            </Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.daoName')}</Dt>
            <Dd>Aragon DAO</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.summary')}</Dt>
            <Dd>
              This is a short description of your DAO, so please look that
              it&apos;s not that long as wished. 👀
            </Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.links')}</Dt>
            <Dd>
              <div className="space-y-1.5">
                <ListItemLink label="Forum" href="https://forum.aragon.org" />
                <ListItemLink label="Discord" href="https://discord.com" />
              </div>
            </Dd>
          </Dl>
        </DescriptionListContainer>

        <DescriptionListContainer title={t('labels.review.community')}>
          <Dl>
            <Dt>{t('labels.review.eligibleMembers')}</Dt>
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
            <Dd>15% (150 TKN)</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.minimumSupport')}</Dt>
            <Dd>50%</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.minimumDuration')}</Dt>
            <Dd>5 Days 12 Hours 30 Minutes</Dd>
          </Dl>
        </DescriptionListContainer>

        <RouterLink to={generatePath(EditSettings, {network, dao})}>
          <ButtonText
            label={t('settings.proposeSettings')}
            className="mx-auto mt-5 w-full tablet:w-max"
            size="large"
            iconLeft={<IconGovernance />}
          />
        </RouterLink>
      </div>
    </PageWrapper>
  );
};

export default withTransaction('Settings', 'component')(Settings);
