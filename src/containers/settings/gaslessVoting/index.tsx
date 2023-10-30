import {IconLinkExternal, Link, Tag} from '@aragon/ods-old';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {Loading} from 'components/temporary';
import {
  Definition,
  DescriptionPair,
  SettingsCard,
  Term,
} from 'containers/settings/settingsCard';
import {PluginTypes} from 'hooks/usePluginClient';
import {useVotingSettings} from 'services/aragon-sdk/queries/use-voting-settings';
import {IPluginSettings} from 'pages/settings';
import {getDHMFromSeconds} from 'utils/date';
import {GaslessPluginVotingSettings} from '@vocdoni/offchain-voting';

const GaslessVotingSettings: React.FC<IPluginSettings> = ({daoDetails}) => {
  const {t} = useTranslation();
  // const {network} = useNetwork();
  // const navigate = useNavigate();

  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;

  const {data: pluginVotingSettings, isLoading: votingSettingsLoading} =
    useVotingSettings({pluginAddress, pluginType});

  // todo(kon): finish to implement this page
  // const {data: daoMembers, isLoading: membersLoading} = useDaoMembers(
  //   pluginAddress,
  //   pluginType,
  //   {countOnly: true}
  // );

  // const {data: daoToken, isLoading: daoTokenLoading} =
  //   useDaoToken(pluginAddress);
  //
  // const {data: tokenSupply, isLoading: tokenSupplyLoading} = useTokenSupply(
  //   daoToken?.address ?? ''
  // );
  //
  // const {isTokenMintable: canMintToken} = useExistingToken({
  //   daoToken,
  //   daoDetails,
  // });

  const isLoading = votingSettingsLoading;
  // ||
  // membersLoading ||
  // daoTokenLoading ||
  // tokenSupplyLoading;

  if (isLoading) {
    return <Loading />;
  }

  const dataIsFetched = !!daoDetails && !!pluginVotingSettings;
  // !!daoMembers &&
  // !!daoToken &&
  // !!tokenSupply;

  if (!dataIsFetched) {
    return null;
  }

  const votingSettings = pluginVotingSettings as GaslessPluginVotingSettings;

  const {days, hours, minutes} = getDHMFromSeconds(
    votingSettings.expirationTime
  );

  return (
    <>
      {/* COMMUNITY SECTION */}
      <SettingsCard title={t('navLinks.executiveCommittee')}>
        <DescriptionPair>
          <Term>{t('labels.review.members')}</Term>
          <Definition>
            <Link
              label={t('createDAO.review.distributionLink', {
                count: votingSettings.minTallyApprovals,
              })}
              // todo(kon): Implement visualization with modal
              onClick={() => open('committeeMembers')}
            />
          </Definition>
        </DescriptionPair>
        <DescriptionPair>
          <Term>{t('labels.minimumApproval')}</Term>
          <Definition>
            {t('labels.review.multisigMinimumApprovals', {
              count: votingSettings.minTallyApprovals,
              total: 0, // todo(kon): how to retrieve executive committe count
            })}
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
        {/*  <DescriptionPair>*/}
        {/*    <Term>{t('votingTerminal.token')}</Term>*/}
        {/*    <Definition>*/}
        {/*      <div className="flex flex-1 flex-wrap items-start justify-between gap-y-1">*/}
        {/*        <Link*/}
        {/*          label={`${daoToken.name} ${daoToken.symbol}`}*/}
        {/*          iconRight={<IconLinkExternal />}*/}
        {/*          href={daoTokenBlockUrl}*/}
        {/*          description={shortenAddress(daoToken.address)}*/}
        {/*          className="shrink-0"*/}
        {/*        />*/}
        {/*        {canMintToken && (*/}
        {/*          <Tag label={t('labels.mintableByDao')} colorScheme="neutral" />*/}
        {/*        )}*/}
        {/*      </div>*/}
        {/*    </Definition>*/}
        {/*  </DescriptionPair>*/}
        {/*  <DescriptionPair>*/}
        {/*    <Term>{t('labels.review.distribution')}</Term>*/}
        {/*    <Definition>*/}
        {/*      <Link*/}
        {/*        label={t('settings.community.distributionValue', {*/}
        {/*          value: daoMembers.memberCount,*/}
        {/*        })}*/}
        {/*        description={t('settings.community.distributionHelptext')}*/}
        {/*        iconRight={<IconLinkExternal />}*/}
        {/*        onClick={() =>*/}
        {/*          navigate(*/}
        {/*            generatePath(Community, {network, dao: daoDetails.address})*/}
        {/*          )*/}
        {/*        }*/}
        {/*      />*/}
        {/*    </Definition>*/}
        {/*  </DescriptionPair>*/}
        {/*  <DescriptionPair className="border-none">*/}
        {/*    <Term>{t('labels.supply')}</Term>*/}
        {/*    <Definition>*/}
        {/*      {`${tokenSupply.formatted} ${daoToken.symbol}`}*/}
        {/*    </Definition>*/}
        {/*  </DescriptionPair>*/}
        {/*</SettingsCard>*/}
        {/*/!* GOVERNANCE SECTION *!/*/}
        {/*<SettingsCard title={t('labels.review.governance')}>*/}
        {/*  <DescriptionPair>*/}
        {/*    <Term>{t('labels.minimumApprovalThreshold')}</Term>*/}
        {/*    <Definition>*/}
        {/*      {`>${Math.round(votingSettings.supportThreshold * 100)}%`}*/}
        {/*    </Definition>*/}
        {/*  </DescriptionPair>*/}
        {/*  <DescriptionPair>*/}
        {/*    <Term>{t('labels.minimumParticipation')}</Term>*/}
        {/*    <Definition>*/}
        {/*      {`≥${Math.round(votingSettings.minParticipation * 100)}% (≥ ${*/}
        {/*        votingSettings.minParticipation * (tokenSupply.formatted ?? 0)*/}
        {/*      } ${daoToken.symbol})`}*/}
        {/*    </Definition>*/}
        {/*  </DescriptionPair>*/}
        {/*  <DescriptionPair>*/}
        {/*    <Term>{t('labels.minimumDuration')}</Term>*/}
        {/*    <Definition>*/}
        {/*      {t('governance.settings.preview', {*/}
        {/*        days,*/}
        {/*        hours,*/}
        {/*        minutes,*/}
        {/*      })}*/}
        {/*    </Definition>*/}
        {/*  </DescriptionPair>*/}
        {/*  <DescriptionPair>*/}
        {/*    <Term>{t('labels.review.earlyExecution')}</Term>*/}
        {/*    <Definition>{votingMode.earlyExecution}</Definition>*/}
        {/*  </DescriptionPair>*/}
        {/*  <DescriptionPair>*/}
        {/*    <Term>{t('labels.review.voteReplacement')}</Term>*/}
        {/*    <Definition>{votingMode.voteReplacement}</Definition>*/}
        {/*  </DescriptionPair>*/}
        {/*  <DescriptionPair className="border-none">*/}
        {/*    <Term>{t('labels.review.proposalThreshold')}</Term>*/}
        {/*    <Definition>*/}
        {/*      {t('labels.review.tokenHoldersWithTkns', {*/}
        {/*        tokenAmount: formatUnits(*/}
        {/*          votingSettings.minProposerVotingPower ?? 0,*/}
        {/*          daoToken.decimals*/}
        {/*        ),*/}
        {/*        tokenSymbol: daoToken.symbol,*/}
        {/*      })}*/}
        {/*    </Definition>*/}
        {/*  </DescriptionPair>*/}
      </SettingsCard>
    </>
  );
};

export default GaslessVotingSettings;
