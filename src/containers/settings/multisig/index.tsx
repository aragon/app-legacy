import {IconLinkExternal, Link} from '@aragon/ods-old';
import {MultisigVotingSettings} from '@aragon/sdk-client';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import {Loading} from 'components/temporary';
import {
  Definition,
  DescriptionPair,
  SettingsCard,
  Term,
} from 'containers/settings/settingsCard';
import {useNetwork} from 'context/network';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {PluginTypes} from 'hooks/usePluginClient';
import {useVotingSettings} from 'services/aragon-sdk/queries/use-voting-settings';
import {IPluginSettings} from 'pages/settings';
import {Community} from 'utils/paths';

const MultisigSettings: React.FC<IPluginSettings> = ({daoDetails}) => {
  const {t} = useTranslation();
  const {network} = useNetwork(); // TODO get the network from daoDetails
  const navigate = useNavigate();

  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;

  const {data: pluginVotingSettings, isLoading: votingSettingsLoading} =
    useVotingSettings({
      pluginAddress,
      pluginType,
    });

  const {data: daoMembers, isLoading: membersLoading} = useDaoMembers(
    pluginAddress,
    pluginType,
    {countOnly: true}
  );

  const isLoading = votingSettingsLoading || membersLoading;
  if (isLoading) {
    return <Loading />;
  }

  const dataIsFetched = !!pluginVotingSettings && !!daoMembers && !!daoDetails;
  if (!dataIsFetched) {
    return null;
  }

  const votingSettings = pluginVotingSettings as MultisigVotingSettings;

  return (
    <>
      {/* COMMUNITY SECTION */}
      <SettingsCard title={t('navLinks.members')}>
        <DescriptionPair>
          <Term>{t('labels.review.eligibleVoters')}</Term>
          <Definition>{t('createDAO.step3.multisigMembers')}</Definition>
        </DescriptionPair>

        <DescriptionPair className="border-none">
          <Term>{t('labels.members')}</Term>
          <Definition>
            <Link
              label={t('createDAO.review.distributionLink', {
                count: daoMembers.memberCount,
              })}
              description={t('settings.community.memberHelptext')}
              iconRight={<IconLinkExternal />}
              onClick={() =>
                navigate(
                  generatePath(Community, {network, dao: daoDetails.address})
                )
              }
            />
          </Definition>
        </DescriptionPair>
      </SettingsCard>

      {/* GOVERNANCE SECTION */}
      <SettingsCard title={t('labels.review.governance')}>
        <DescriptionPair>
          <Term>{t('labels.minimumApproval')}</Term>
          <Definition>{`${votingSettings.minApprovals} of ${
            daoMembers.memberCount
          } ${t('labels.authorisedWallets')}`}</Definition>
        </DescriptionPair>

        <DescriptionPair className="border-none">
          <Term>{t('labels.proposalCreation')}</Term>
          <Definition>
            {votingSettings.onlyListed
              ? t('createDAO.step3.multisigMembers')
              : t('createDAO.step3.eligibility.anyWallet.title')}
          </Definition>
        </DescriptionPair>
      </SettingsCard>
    </>
  );
};

export default MultisigSettings;
