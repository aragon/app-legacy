import React from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import {
  MajorityVotingSettings as VotingSettings,
  VotingMode,
} from '@aragon/sdk-client';
import {Link, Tag} from '@aragon/ods';

import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {useNetwork} from 'context/network';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoToken} from 'hooks/useDaoToken';
import {PluginTypes} from 'hooks/usePluginClient';
import {useVotingSettings} from 'hooks/useVotingSettings';
import {useTokenSupply} from 'hooks/useTokenSupply';
import {getDHMFromSeconds} from 'utils/date';
import {formatUnits} from 'utils/library';
import {Community} from 'utils/paths';
import {IPluginSettings} from 'pages/settings';
import {useExistingToken} from 'hooks/useExistingToken';
import {Loading} from 'components/temporary';

const MajorityVotingSettings: React.FC<IPluginSettings> = ({daoDetails}) => {
  const {t} = useTranslation();
  const {network} = useNetwork(); // TODO get the network from daoDetails
  const navigate = useNavigate();

  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;

  const {data: pluginVotingSettings, isLoading: votingSettingsLoading} =
    useVotingSettings({pluginAddress, pluginType});

  const {data: daoMembers, isLoading: membersLoading} = useDaoMembers(
    pluginAddress,
    pluginType
  );

  const {data: daoToken, isLoading: daoTokenLoading} =
    useDaoToken(pluginAddress);

  const {data: tokenSupply, isLoading: tokenSupplyLoading} = useTokenSupply(
    daoToken?.address ?? ''
  );

  const {isTokenMintable} = useExistingToken({daoToken, daoDetails});

  const isLoading =
    votingSettingsLoading ||
    membersLoading ||
    daoTokenLoading ||
    tokenSupplyLoading;

  if (isLoading) {
    return <Loading />;
  }

  const dataIsFetched =
    !!daoDetails &&
    !!pluginVotingSettings &&
    !!daoMembers &&
    !!daoToken &&
    !!tokenSupply;

  if (!dataIsFetched) {
    return null;
  }

  const votingSettings = pluginVotingSettings as VotingSettings;

  const {days, hours, minutes} = getDHMFromSeconds(votingSettings.minDuration);

  const votingMode = {
    // Note: This implies that earlyExecution and voteReplacement may never be
    // both true at the same time, as they shouldn't.
    earlyExecution:
      votingSettings.votingMode === VotingMode.EARLY_EXECUTION
        ? t('labels.yes')
        : t('labels.no'),
    voteReplacement:
      votingSettings.votingMode === VotingMode.VOTE_REPLACEMENT
        ? t('labels.yes')
        : t('labels.no'),
  };

  return (
    <div className="space-y-3">
      {/* COMMUNITY SECTION */}
      <DescriptionListContainer title={t('navLinks.community')}>
        <Dl>
          <Dt>{t('labels.review.eligibleVoters')}</Dt>
          <Dd>{t('createDAO.step3.tokenMembership')}</Dd>
        </Dl>

        <Dl>
          <Dt>{t('votingTerminal.token')}</Dt>
          <Dd>
            <div className="flex items-center space-x-1.5">
              <p>{daoToken.name}</p>
              <p>{daoToken.symbol}</p>
            </div>
          </Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.supply')}</Dt>
          <Dd>
            <div className="flex items-center space-x-1.5">
              <p>
                {tokenSupply.formatted} {daoToken.symbol}
              </p>
              {isTokenMintable && <Tag label={t('labels.mintable')} />}
            </div>
          </Dd>
        </Dl>

        <Dl>
          <Dt>{t('labels.review.distribution')}</Dt>
          <Dd>
            <Link
              label={t('createDAO.review.distributionLink', {
                count: daoMembers.members.length,
              })}
              onClick={() =>
                navigate(
                  generatePath(Community, {network, dao: daoDetails.address})
                )
              }
            />
          </Dd>
        </Dl>
      </DescriptionListContainer>

      {/* GOVERNANCE SECTION */}
      <DescriptionListContainer title={t('labels.review.governance')}>
        <Dl>
          <Dt>{t('labels.minimumApprovalThreshold')}</Dt>
          <Dd>
            {'>'}
            {Math.round(votingSettings.supportThreshold * 100)}%
          </Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.minimumParticipation')}</Dt>

          <Dd>
            {'≥'}
            {Math.round(votingSettings.minParticipation * 100)}% ({'≥'}
            {votingSettings.minParticipation * tokenSupply.formatted}{' '}
            {daoToken.symbol})
          </Dd>
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

        <Dl>
          <Dt>{t('labels.review.proposalThreshold')}</Dt>
          <Dd>
            {t('labels.review.tokenHoldersWithTkns', {
              tokenAmount: formatUnits(
                votingSettings.minProposerVotingPower ?? 0,
                daoToken.decimals
              ),
              tokenSymbol: daoToken.symbol,
            })}
          </Dd>
        </Dl>
      </DescriptionListContainer>
    </div>
  );
};

export default MajorityVotingSettings;
