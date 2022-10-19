import {
  AlertInline,
  AvatarDao,
  Badge,
  ButtonText,
  IconGovernance,
  Link,
  ListItemLink,
  Wizard,
} from '@aragon/ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';

import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {Loading} from 'components/temporary';
import {PageWrapper} from 'components/wrappers';
import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoParam} from 'hooks/useDaoParam';
import {useDaoToken} from 'hooks/useDaoToken';
import {PluginTypes} from 'hooks/usePluginClient';
import {usePluginSettings} from 'hooks/usePluginSettings';
import useScreen from 'hooks/useScreen';
import {CHAIN_METADATA} from 'utils/constants';
import {getDHMFromSeconds} from 'utils/date';
import {formatUnits} from 'utils/library';
import {Community, EditSettings} from 'utils/paths';
import {getTokenInfo} from 'utils/tokens';

const Settings: React.FC = () => {
  const {data: daoId, isLoading} = useDaoParam();
  const {t} = useTranslation();
  const {network} = useNetwork();
  const navigate = useNavigate();
  const {infura} = useProviders();

  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetails(
    daoId!
  );
  const {data: daoSettings, isLoading: settingsAreLoading} = usePluginSettings(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes
  );

  const {data: daoMembers, isLoading: MembersAreLoading} = useDaoMembers(
    daoDetails?.plugins?.[0]?.instanceAddress || '',
    (daoDetails?.plugins?.[0]?.id as PluginTypes) || undefined
  );

  const {data: daoToken, isLoading: tokensAreLoading} = useDaoToken(
    daoDetails?.plugins?.[0]?.instanceAddress || ''
  );

  const [tokenSupply, setTokenSupply] = useState(0);
  const nativeCurrency = CHAIN_METADATA[network].nativeCurrency;

  useEffect(() => {
    // Fetching necessary info about the token.
    if (daoToken?.address) {
      getTokenInfo(daoToken.address, infura, nativeCurrency)
        .then((r: Awaited<ReturnType<typeof getTokenInfo>>) => {
          const formattedNumber = parseFloat(
            formatUnits(r.totalSupply, r.decimals)
          );
          setTokenSupply(formattedNumber);
        })
        .catch(e =>
          console.error('Error happened when fetching token infos: ', e)
        );
    }
  }, [daoToken?.address, nativeCurrency, infura, network]);

  if (
    isLoading ||
    detailsAreLoading ||
    settingsAreLoading ||
    MembersAreLoading ||
    tokensAreLoading
  ) {
    return <Loading />;
  }

  const {days, hours, minutes} = getDHMFromSeconds(daoSettings.minDuration);
  const isErc20Plugin =
    (daoDetails?.plugins?.[0]?.id as PluginTypes) === 'erc20voting.dao.eth';

  return (
    <SettingsWrapper>
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

        <DescriptionListContainer
          title={t('labels.review.daoMetadata')}
          badgeLabel={t('labels.changeableVote')}
        >
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
              {isErc20Plugin
                ? t('createDAO.step3.tokenMembership')
                : t('createDAO.step3.walletMemberShip')}
            </Dd>
          </Dl>
          {isErc20Plugin && (
            <>
              <Dl>
                <Dt>{t('votingTerminal.token')}</Dt>
                <Dd>
                  <div className="flex items-center space-x-1.5">
                    <p>{daoToken?.name}</p>
                    <p>{daoToken?.symbol}</p>
                  </div>
                </Dd>
              </Dl>
              <Dl>
                <Dt>{t('labels.supply')}</Dt>
                <Dd>
                  <div className="flex items-center space-x-1.5">
                    <p>
                      {tokenSupply} {daoToken?.symbol}
                    </p>
                    <Badge label="Mintable" />
                  </div>
                </Dd>
              </Dl>
            </>
          )}
          <Dl>
            <Dt>{t('labels.review.distribution')}</Dt>
            <Dd>
              <Link
                label={t('createDAO.review.distributionLink', {
                  count: daoMembers.members.length,
                })}
                onClick={() =>
                  navigate(generatePath(Community, {network, dao: daoId}))
                }
              />
            </Dd>
          </Dl>
        </DescriptionListContainer>

        <DescriptionListContainer
          title={t('labels.review.governance')}
          badgeLabel={t('labels.changeable')}
        >
          <Dl>
            <Dt>{t('labels.minimumApproval')}</Dt>
            {isErc20Plugin ? (
              <Dd>
                {Math.round(daoSettings.minTurnout * 100)}% (
                {daoSettings.minTurnout * tokenSupply} {daoToken?.symbol})
              </Dd>
            ) : (
              <Dd>{Math.round(daoSettings.minTurnout * 100)}%</Dd>
            )}
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
      </div>

      <div className="space-y-2">
        <ButtonText
          label={t('settings.edit')}
          className="mt-5 desktop:mt-8 w-full tablet:w-max"
          size="large"
          iconLeft={<IconGovernance />}
          onClick={() => navigate('edit')}
        />
        <AlertInline label={t('settings.proposeSettingsInfo')} />
      </div>
    </SettingsWrapper>
  );
};

const SettingsWrapper: React.FC = ({children}) => {
  const {t} = useTranslation();
  const {isMobile} = useScreen();
  const navigate = useNavigate();
  const {dao: daoId} = useParams();
  const {network} = useNetwork();

  if (isMobile) {
    return (
      <PageWrapper
        title={t('labels.daoSettings')}
        buttonLabel={t('settings.proposeSettings')}
        showButton={isMobile}
        buttonIcon={<IconGovernance />}
        onClick={() => navigate(generatePath(EditSettings, {network, daoId}))}
      >
        {children}
      </PageWrapper>
    );
  }

  return (
    <Layout>
      <Wizard
        title={t('labels.daoSettings')}
        nav={null}
        description={null}
        includeStepper={false}
      />
      <div className="mx-auto desktop:w-3/5">{children}</div>
    </Layout>
  );
};

export default withTransaction('Settings', 'component')(Settings);

const Layout = styled.div.attrs({
  className:
    'col-span-full desktop:col-start-2 desktop:col-end-12 font-medium text-ui-600',
})``;
