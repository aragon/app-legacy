import {useTranslation} from 'react-i18next';

import {ActionParameter, HookData} from 'utils/types';
import {useDaoQuery} from './useDaoDetails';
import {i18n} from '../../i18n.config';

export const baseActions: ActionParameter[] = [
  {
    type: 'withdraw_assets',
    title: i18n.t('TransferModal.item2Title'),
    subtitle: i18n.t('AddActionModal.withdrawAssetsSubtitle'),
    isReuseable: true,
  },
  {
    type: 'external_contract_modal',
    title: i18n.t('AddActionModal.externalContract'),
    subtitle: i18n.t('AddActionModal.externalContractSubtitle'),
    isReuseable: true,
  },
];

export function useDaoActions(dao: string): HookData<ActionParameter[]> {
  const {data: daoDetails, error, isLoading} = useDaoQuery(dao);
  const multisig = daoDetails?.plugins[0].id === 'multisig.plugin.dao.eth';

  const {t} = useTranslation();

  const multisigActions = baseActions.concat([
    {
      type: 'add_address',
      title: t('AddActionModal.addAddresses'),
      subtitle: t('AddActionModal.addAddressesSubtitle'),
    },
    {
      type: 'remove_address',
      title: t('AddActionModal.removeAddresses'),
      subtitle: t('AddActionModal.removeAddressesSubtitle'),
    },
  ]);

  const tokenVotingActions = baseActions.concat([
    {
      type: 'mint_tokens',
      title: t('AddActionModal.mintTokens'),
      subtitle: t('AddActionModal.mintTokensSubtitle'),
    },
  ]);

  return {
    data: multisig ? multisigActions : tokenVotingActions,
    isLoading,
    error: error as Error,
  };
}
