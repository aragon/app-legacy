import {makeVar} from '@apollo/client';
import {
  CreateDaoParams,
  DaoListItem,
  DaoMetadata,
  InstalledPluginListItem,
} from '@aragon/sdk-client';
import {PluginInstallItem} from '@aragon/sdk-client-common';

import {SupportedChainID, SupportedNetworks} from 'utils/constants';

/*************************************************
 *            FAVORITE & SELECTED DAOS           *
 *************************************************/
// including description, type, and chain in anticipation for
// showing these daos on explorer page
export type NavigationDao = Omit<DaoListItem, 'metadata' | 'plugins'> & {
  chain: SupportedChainID;
  metadata: {
    name: string;
    avatar?: string;
    description?: string;
  };
  plugins: InstalledPluginListItem[] | PluginInstallItem[];
};

const selectedDaoVar = makeVar<NavigationDao>({
  address: '',
  ensDomain: '',
  metadata: {
    name: '',
    avatar: '',
  },
  chain: 5,
  plugins: [],
});

/*************************************************
 *                   PENDING DAOs                *
 *************************************************/
export type PendingDao = CreateDaoParams & {
  metadata: DaoMetadata;
  creationDate: Date;
};

export type PendingDaoCreation = {
  [key in SupportedNetworks]?: {
    // This key is the id of the newly created DAO
    [key: string]: PendingDao;
  };
};

export {selectedDaoVar};
