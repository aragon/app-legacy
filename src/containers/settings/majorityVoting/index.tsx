import React from 'react';
import {Link} from '@aragon/ods-old';
import {VotingMode, VotingSettings} from '@aragon/sdk-client';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import {IconType, Tag} from '@aragon/ods';

import {Loading} from 'components/temporary';
import {
  Definition,
  DescriptionPair,
  SettingsCard,
  Term,
} from 'containers/settings/settingsCard';
import {useNetwork} from 'context/network';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoToken} from 'hooks/useDaoToken';
import {useExistingToken} from 'hooks/useExistingToken';
import {GaslessPluginName, PluginTypes} from 'hooks/usePluginClient';
import {useTokenSupply} from 'hooks/useTokenSupply';
import {useVotingSettings} from 'services/aragon-sdk/queries/use-voting-settings';
import {IPluginSettings} from 'pages/settings';
import {CHAIN_METADATA} from 'utils/constants';
import {getDHMFromSeconds} from 'utils/date';
import {formatUnits, shortenAddress} from 'utils/library';
import {Community} from 'utils/paths';

const MajorityVotingSettings: React.FC<IPluginSettings> = ({daoDetails}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const navigate = useNavigate();

  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;
  const isGasless = pluginType === GaslessPluginName;

  const {data: pluginVotingSettings, isLoading: votingSettingsLoading} =
    useVotingSettings({pluginAddress, pluginType});

  const {data: daoMembers, isLoading: membersLoading} = useDaoMembers(
    pluginAddress,
    pluginType,
    {countOnly: true}
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

  const explorerPath =
    network === 'zksyncMainnet' || network === 'zksyncSepolia'
      ? 'address/'
      : 'token/';
  const daoTokenBlockUrl = `${CHAIN_METADATA[network].explorer}${explorerPath}${daoToken?.address}`;

  return (
    <>
      {/* COMMUNITY SECTION */}
      <SettingsCard title={t('navLinks.members')}>
        <DescriptionPair>
          <Term>{t('labels.review.eligibleVoters')}</Term>
          <Definition>{t('createDAO.step3.tokenMembership')}</Definition>
        </DescriptionPair>
        <DescriptionPair>
          <Term>{t('votingTerminal.token')}</Term>
          <Definition>
            <div className="flex flex-1 flex-wrap items-start justify-between gap-y-2">
              <Link
                label={`${daoToken.name} (${daoToken.symbol})`}
                iconRight={IconType.LINK_EXTERNAL}
                href={daoTokenBlockUrl}
                description={shortenAddress(daoToken.address)}
                className="shrink-0"
              />

              {canMintToken && <Tag label={t('labels.mintableByDao')} />}
            </div>
          </Definition>
        </DescriptionPair>
        <DescriptionPair>
          <Term>{t('labels.review.distribution')}</Term>
          <Definition>
            <Link
              label={t('settings.community.distributionValue', {
                value: daoMembers.memberCount,
              })}
              description={t('settings.community.distributionHelptext')}
              iconRight={IconType.LINK_EXTERNAL}
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
          <Definition>
            {`${tokenSupply.formatted} ${daoToken.symbol}`}
          </Definition>
        </DescriptionPair>
      </SettingsCard>

      {/* GOVERNANCE SECTION */}
      <SettingsCard title={t('labels.review.governance')}>
        <DescriptionPair>
          <Term>{t('labels.minimumApprovalThreshold')}</Term>
          <Definition>
            {`>${Math.round(votingSettings.supportThreshold * 100)}%`}
          </Definition>
        </DescriptionPair>
        <DescriptionPair>
          <Term>{t('labels.minimumParticipation')}</Term>
          <Definition>
            {`≥${Math.round(votingSettings.minParticipation * 100)}% (≥ ${
              votingSettings.minParticipation * (tokenSupply.formatted ?? 0)
            } ${daoToken.symbol})`}
          </Definition>
        </DescriptionPair>
        <DescriptionPair>
          <Term>{t('labels.minimumDuration')}</Term>
          <Definition>
            {t('governance.settings.preview', {
              days,
              hours,
              minutes,
            })}
          </Definition>
        </DescriptionPair>
        {!isGasless && (
          <>
            <DescriptionPair>
              <Term>{t('labels.review.earlyExecution')}</Term>
              <Definition>{votingMode.earlyExecution}</Definition>
            </DescriptionPair>
            <DescriptionPair>
              <Term>{t('labels.review.voteReplacement')}</Term>
              <Definition>{votingMode.voteReplacement}</Definition>
            </DescriptionPair>
          </>
        )}
        <DescriptionPair className="border-none">
          <Term>{t('labels.review.proposalThreshold')}</Term>
          <Definition>
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
