import {Link} from '@aragon/ods-old';
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
import {GaslessPluginVotingSettings} from '@vocdoni/gasless-voting';
import {useGlobalModalContext} from 'context/globalModals';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {FilteredAddressList} from 'components/filteredAddressList';
import {MultisigWalletField} from 'components/multisigWallets/row';
import {CHAIN_METADATA} from 'utils/constants';
import {useNetwork} from 'context/network';

const GaslessVotingSettings: React.FC<IPluginSettings> = ({daoDetails}) => {
  const {t} = useTranslation();

  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;
  const {open} = useGlobalModalContext();

  const {data: pluginVotingSettings, isLoading: votingSettingsLoading} =
    useVotingSettings({pluginAddress, pluginType});

  const isLoading = votingSettingsLoading;

  if (isLoading) {
    return <Loading />;
  }

  const dataIsFetched = !!daoDetails && !!pluginVotingSettings;

  if (!dataIsFetched) {
    return null;
  }

  const votingSettings = pluginVotingSettings as GaslessPluginVotingSettings;

  const {days, hours, minutes} = getDHMFromSeconds(
    votingSettings.minTallyDuration
  );

  return (
    <>
      <SettingsCard title={t('label.executionMultisig')}>
        <DescriptionPair>
          <Term>{t('labels.members')}</Term>
          <Definition>
            <Link
              label={t('createDAO.review.distributionLink', {
                count: votingSettings.executionMultisigMembers?.length,
              })}
              onClick={() => open('committeeMembers')}
            />
          </Definition>
        </DescriptionPair>
        <DescriptionPair>
          <Term>{t('labels.minimumApproval')}</Term>
          <Definition>
            {t('labels.review.multisigMinimumApprovals', {
              count: votingSettings.minTallyApprovals,
              total: votingSettings.executionMultisigMembers?.length,
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
      </SettingsCard>
      <CustomCommitteeAddressesModal
        wallets={
          votingSettings.executionMultisigMembers?.map(wallet => ({
            address: wallet,
            ensName: '',
          })) as MultisigWalletField[]
        }
      />
    </>
  );
};

const CustomCommitteeAddressesModal = ({
  wallets,
}: {
  wallets: MultisigWalletField[];
}) => {
  const {isOpen, close} = useGlobalModalContext('committeeMembers');
  const {network} = useNetwork();

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <ModalBottomSheetSwitcher
      isOpen={isOpen}
      onClose={close}
      data-testid="communityModal"
    >
      <FilteredAddressList
        wallets={wallets}
        onVoterClick={user => {
          window.open(
            `${CHAIN_METADATA[network].explorer}address/${user}`,
            '_blank'
          );
        }}
      />
    </ModalBottomSheetSwitcher>
  );
};

export default GaslessVotingSettings;
