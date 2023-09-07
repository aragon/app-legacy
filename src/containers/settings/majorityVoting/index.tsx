import {IconLinkExternal, Link, Tag} from '@aragon/ods';
import {VotingMode, VotingSettings} from '@aragon/sdk-client';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import {Loading} from 'components/temporary';
import {
  Definition,
  DescriptionPair,
  SettingsCard,
  Term,
} from 'containers/settingsCard';
import {useNetwork} from 'context/network';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoToken} from 'hooks/useDaoToken';
import {useExistingToken} from 'hooks/useExistingToken';
import {PluginTypes} from 'hooks/usePluginClient';
import {useTokenSupply} from 'hooks/useTokenSupply';
import {useVotingSettings} from 'hooks/useVotingSettings';
import {IPluginSettings} from 'pages/settings';
import {CHAIN_METADATA} from 'utils/constants';
import {getDHMFromSeconds} from 'utils/date';
import {formatUnits} from 'utils/library';
import {Community} from 'utils/paths';

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

  const {isTokenMintable: canMintToken} = useExistingToken({
    daoToken,
    daoDetails,
  });

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

  const daoTokenBlockUrl =
    CHAIN_METADATA[network].explorer + 'token/' + daoToken?.address;

  return (
    <>
      {/* COMMUNITY SECTION */}
      <SettingsCard title={t('navLinks.community')}>
        <DescriptionPair>
          <Term>{t('labels.review.eligibleVoters')}</Term>
          <Definition>{t('createDAO.step3.tokenMembership')}</Definition>
        </DescriptionPair>
        <DescriptionPair>
          <Term>{t('votingTerminal.token')}</Term>
          <Definition className="justify-between items-center">
            <Link
              label={`${daoToken.name} ${daoToken.symbol}`}
              iconRight={<IconLinkExternal />}
              href={daoTokenBlockUrl}
            />
            {canMintToken && (
              <Tag label={'Mintable by DAO'} colorScheme="neutral" />
            )}
          </Definition>
        </DescriptionPair>
        <DescriptionPair>
          <Term>{t('labels.review.distribution')}</Term>
          <Definition>
            <Link
              label={`${daoMembers.members.length} token holders`}
              iconRight={<IconLinkExternal />}
              onClick={() =>
                navigate(
                  generatePath(Community, {network, dao: daoDetails.address})
                )
              }
            />
          </Definition>
        </DescriptionPair>
        <DescriptionPair className="border-none">
          <Term>{t('labels.supply')}</Term>
          <Definition className="font-semibold ft-text-base">
            {`${tokenSupply.formatted} ${daoToken.symbol}`}
          </Definition>
        </DescriptionPair>
      </SettingsCard>

      {/* GOVERNANCE SECTION */}
      <SettingsCard title={t('labels.review.governance')}>
        <DescriptionPair>
          <Term>{t('labels.minimumApprovalThreshold')}</Term>
          <Definition className="font-semibold ft-text-base">
            {`>${Math.round(votingSettings.supportThreshold * 100)}%`}
          </Definition>
        </DescriptionPair>
        <DescriptionPair>
          <Term>{t('labels.minimumParticipation')}</Term>
          <Definition className="font-semibold ft-text-base">
            {`≥${Math.round(votingSettings.minParticipation * 100)}% (≥ ${
              votingSettings.minParticipation * (tokenSupply.formatted ?? 0)
            } ${daoToken.symbol})`}
          </Definition>
        </DescriptionPair>
        <DescriptionPair>
          <Term>{t('labels.minimumDuration')}</Term>
          <Definition className="font-semibold ft-text-base">
            {t('governance.settings.preview', {
              days,
              hours,
              minutes,
            })}
          </Definition>
        </DescriptionPair>
        <DescriptionPair>
          <Term>{t('labels.review.earlyExecution')}</Term>
          <Definition className="font-semibold ft-text-base">
            {votingMode.earlyExecution}
          </Definition>
        </DescriptionPair>
        <DescriptionPair>
          <Term>{t('labels.review.voteReplacement')}</Term>
          <Definition className="font-semibold ft-text-base">
            {votingMode.voteReplacement}
          </Definition>
        </DescriptionPair>
        <DescriptionPair className="border-none">
          <Term>{t('labels.review.proposalThreshold')}</Term>
          <Definition className="font-semibold ft-text-base">
            {t('labels.review.tokenHoldersWithTkns', {
              tokenAmount: formatUnits(
                votingSettings.minProposerVotingPower ?? 0,
                daoToken.decimals
              ),
              tokenSymbol: daoToken.symbol,
            })}
          </Definition>
        </DescriptionPair>
      </SettingsCard>
    </>
  );
};

export default MajorityVotingSettings;
