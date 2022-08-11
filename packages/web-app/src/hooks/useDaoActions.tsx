import {useTranslation} from 'react-i18next';

import {ActionParameter, HookData} from 'utils/types';
import {useDaoMetadata} from './useDaoMetadata';

export function useDaoActions(dao: string): HookData<ActionParameter[]> {
  const {data, error, loading: isLoading} = useDaoMetadata(dao);
  const whitelist = data?.packages[0].pkg.__typename === 'WhitelistPackage';

  const {t} = useTranslation();

  const baseActions: ActionParameter[] = [
    {
      type: 'withdraw_assets',
      title: t('AddActionModal.withdrawAssets'),
      subtitle: t('AddActionModal.withdrawAssetsSubtitle'),
      isReuseable: true,
    },
    {
      type: 'modify_settings',
      // TODO: Replace these with proper copies and i18n.
      title: 'Modify Settings',
      subtitle: 'Propose new settings for your DAO',
    },
    {
      type: 'external_contract',
      title: t('AddActionModal.externalContract'),
      subtitle: t('AddActionModal.externalContractSubtitle'),
      isReuseable: true,
    },
  ];

  const whitelistActions = baseActions.concat([
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

  const erc20Actions = baseActions.concat([
    {
      type: 'mint_token',
      title: t('AddActionModal.mintTokens'),
      subtitle: t('AddActionModal.mintTokensSubtitle'),
    },
  ]);

  return {
    data: whitelist ? whitelistActions : erc20Actions,
    isLoading,
    error,
  };
}
