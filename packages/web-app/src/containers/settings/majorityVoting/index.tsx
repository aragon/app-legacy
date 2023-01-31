import React from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import {VotingMode, VotingSettings} from '@aragon/sdk-client';
import {Link, Tag} from '@aragon/ui-components';

import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {useNetwork} from 'context/network';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoToken} from 'hooks/useDaoToken';
import {PluginTypes} from 'hooks/usePluginClient';
import {usePluginSettings} from 'hooks/usePluginSettings';
import {useTokenSupply} from 'hooks/useTokenSupply';
import {getDHMFromSeconds} from 'utils/date';
import {formatUnits} from 'utils/library';
import {Community} from 'utils/paths';
import {IPluginSettings} from 'pages/settings';

const MajorityVotingSettings: React.FC<IPluginSettings> = ({daoDetails}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const navigate = useNavigate();

  const {data: votingSettings} = usePluginSettings(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes
  );

  const {data: daoMembers, isLoading: isMembersLoading} = useDaoMembers(
    daoDetails?.plugins?.[0]?.instanceAddress || '',
    (daoDetails?.plugins?.[0]?.id as PluginTypes) || undefined
  );

  const {data: daoToken} = useDaoToken(
    daoDetails?.plugins?.[0]?.instanceAddress || ''
  );
  const {data: tokenSupply} = useTokenSupply(daoToken?.address || '');

  const daoSettings = votingSettings as VotingSettings;

  const {days, hours, minutes} = getDHMFromSeconds(daoSettings.minDuration);
  const isErc20Plugin =
    (daoDetails?.plugins?.[0]?.id as PluginTypes) ===
    'token-voting.plugin.dao.eth';

  const votingMode = {
    // Note: This implies that earlyExecution and voteReplacement may never be
    // both true at the same time, as they shouldn't.
    earlyExecution:
      daoSettings?.votingMode === VotingMode.EARLY_EXECUTION
        ? t('labels.yes')
        : t('labels.no'),
    voteReplacement:
      daoSettings?.votingMode === VotingMode.VOTE_REPLACEMENT
        ? t('labels.yes')
        : t('labels.no'),
  };

  return (
    <div className="space-y-5">
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
                    {tokenSupply?.formatted} {daoToken?.symbol}
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
                count: daoMembers?.members.length,
              })}
              onClick={() =>
                navigate(
                  generatePath(Community, {network, dao: daoDetails?.address})
                )
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
                  daoSettings?.minProposerVotingPower || 0,
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
          <Dt>{t('labels.minimumApprovalThreshold')}</Dt>
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
              {Math.round(daoSettings?.minParticipation * 100)}% ({'≥'}
              {daoSettings?.minParticipation *
                (tokenSupply?.formatted || 0)}{' '}
              {daoToken?.symbol})
            </Dd>
          ) : (
            <Dd>{Math.round(daoSettings?.minParticipation * 100)}%</Dd>
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
  );
};

export default MajorityVotingSettings;
