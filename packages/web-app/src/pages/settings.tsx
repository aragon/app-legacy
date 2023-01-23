import {VotingMode} from '@aragon/sdk-client';
import {
  AlertInline,
  AvatarDao,
  ButtonText,
  IconGovernance,
  Link,
  ListItemLink,
  Tag,
} from '@aragon/ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';

import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {Loading} from 'components/temporary';
import {PageWrapper} from 'components/wrappers';
import {useNetwork} from 'context/network';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoParam} from 'hooks/useDaoParam';
import {useDaoToken} from 'hooks/useDaoToken';
import {PluginTypes} from 'hooks/usePluginClient';
import {usePluginSettings} from 'hooks/usePluginSettings';
import useScreen from 'hooks/useScreen';
import {useTokenSupply} from 'hooks/useTokenSupply';
import {CHAIN_METADATA} from 'utils/constants';
import {getDHMFromSeconds} from 'utils/date';
import {formatUnits} from 'utils/library';
import {Community, EditSettings} from 'utils/paths';

const Settings: React.FC = () => {
  const {data: daoId, isLoading} = useDaoParam();
  const {t} = useTranslation();
  const {network} = useNetwork();
  const navigate = useNavigate();

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
  const {data: tokenSupply, isLoading: tokenSupplyIsLoading} = useTokenSupply(
    daoToken?.address || ''
  );

  const networkInfo = CHAIN_METADATA[network];
  const chainLabel = networkInfo.name;
  const networkType = networkInfo.testnet
    ? t('labels.testNet')
    : t('labels.mainNet');

  if (
    isLoading ||
    detailsAreLoading ||
    settingsAreLoading ||
    MembersAreLoading ||
    tokensAreLoading ||
    tokenSupplyIsLoading
  ) {
    return <Loading />;
  }

  const {days, hours, minutes} = getDHMFromSeconds(daoSettings.minDuration);
  const isErc20Plugin =
    (daoDetails?.plugins?.[0]?.id as PluginTypes) ===
    'token-voting.plugin.dao.eth';

  const resourceLinks = daoDetails?.metadata.links?.filter(
    l => l.name && l.url
  );

  const votingMode = {
    // Note: This implies that earlyExecution and voteReplacement may never be
    // both true at the same time, as they shouldn't.
    earlyExecution:
      daoSettings.votingMode === VotingMode.EARLY_EXECUTION
        ? t('labels.yes')
        : t('labels.no'),
    voteReplacement:
      daoSettings.votingMode === VotingMode.VOTE_REPLACEMENT
        ? t('labels.yes')
        : t('labels.no'),
  };

  return (
    <SettingsWrapper>
      <div className="mt-3 desktop:mt-8 space-y-5">
        {/* BLOCKCHAIN SECTION */}
        <DescriptionListContainer
          title={t('labels.review.blockchain')}
          tagLabel={t('labels.notChangeable')}
        >
          <Dl>
            <Dt>{t('labels.review.network')}</Dt>
            <Dd>{networkType}</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.review.blockchain')}</Dt>
            <Dd>{chainLabel}</Dd>
          </Dl>
        </DescriptionListContainer>

        {/* DAO DETAILS SECTION */}
        <DescriptionListContainer title={t('labels.review.daoMetadata')}>
          <Dl>
            <Dt>{t('labels.logo')}</Dt>
            <Dd>
              <AvatarDao
                size={'small'}
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
          {resourceLinks && resourceLinks.length > 0 && (
            <Dl>
              <Dt>{t('labels.links')}</Dt>
              <Dd>
                <div className="space-y-1.5">
                  {resourceLinks.map(({name, url}) => (
                    <ListItemLink label={name} href={url} key={url} />
                  ))}
                </div>
              </Dd>
            </Dl>
          )}
        </DescriptionListContainer>

        {/* COMMUNITY SECTION */}
        <DescriptionListContainer title={t('navLinks.community')}>
          <Dl>
            <Dt>{t('labels.review.eligibleVoters')}</Dt>
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
                    <Tag label={t('labels.mintable')} />
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
          {isErc20Plugin && (
            <Dl>
              <Dt>{t('labels.review.proposalThreshold')}</Dt>
              <Dd>
                {t('labels.review.tokenHoldersWithTkns', {
                  tokenAmount: formatUnits(
                    daoSettings.minProposerVotingPower || 0,
                    daoToken?.decimals || 18
                  ),
                  tokenSymbol: daoToken?.symbol,
                })}
              </Dd>
            </Dl>
          )}
        </DescriptionListContainer>

        {/* GOVERNANCE SECTION */}
        <DescriptionListContainer title={t('labels.review.governance')}>
          <Dl>
            <Dt>{t('labels.minimumApproval')}</Dt>
            <Dd>
              {'>'}
              {Math.round(daoSettings?.supportThreshold * 100)}%
            </Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.minimumParticipation')}</Dt>
            {isErc20Plugin ? (
              <Dd>
                {'≥'}
                {Math.round(daoSettings.minParticipation * 100)}% ({'≥'}
                {daoSettings.minParticipation * (tokenSupply || 0)}{' '}
                {daoToken?.symbol})
              </Dd>
            ) : (
              <Dd>{Math.round(daoSettings.minParticipation * 100)}%</Dd>
            )}
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
          <Dl>
            <Dt>{t('labels.review.earlyExecution')}</Dt>
            <Dd>{votingMode.earlyExecution}</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.review.voteReplacement')}</Dt>
            <Dd>{votingMode.voteReplacement}</Dd>
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

export const SettingsWrapper: React.FC = ({children}) => {
  const {t} = useTranslation();
  const {isMobile} = useScreen();

  const {dao} = useParams();
  const {network} = useNetwork();
  const navigate = useNavigate();

  return (
    <PageWrapper
      title={t('labels.daoSettings')}
      // TODO add correct description once available in designs [VR 17-01-2023]
      description="Review your DAO's settings"
      primaryBtnProps={
        isMobile
          ? {
              label: t('settings.edit'),
              iconLeft: <IconGovernance />,
              onClick: () =>
                navigate(generatePath(EditSettings, {network, dao})),
            }
          : undefined
      }
      customBody={<Layout>{children}</Layout>}
    />
  );
};

export default withTransaction('Settings', 'component')(Settings);

export const Layout = styled.div.attrs({
  className:
    'col-span-full desktop:col-start-4 desktop:col-end-10 text-ui-600' as string,
})``;
