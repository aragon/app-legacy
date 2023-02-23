import {useTranslation} from 'react-i18next';

import {ActionParameter, HookData} from 'utils/types';
import {useDaoDetails} from './useDaoDetails';

export function useDaoActions(dao: string): HookData<ActionParameter[]> {
  const {data: daoDetails, error, isLoading} = useDaoDetails(dao);
  const multisig = daoDetails?.plugins[0].id === 'multisig.plugin.dao.eth';

  const {t} = useTranslation();

  const baseActions: ActionParameter[] = [
    {
      type: 'withdraw_assets',
      title: t('TransferModal.item2Title'),
      subtitle: t('AddActionModal.withdrawAssetsSubtitle'),
      isReuseable: true,
    },
    // {
    //   type: 'external_contract',
    //   title: t('AddActionModal.externalContract'),
    //   subtitle: t('AddActionModal.externalContractSubtitle'),
    //   isReuseable: true,
    // },
  ];

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
    error,
  };
}
