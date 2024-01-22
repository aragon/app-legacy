import {SupportedNetworks} from 'utils/constants';
import {Address} from 'viem';

export interface IDaoStats {
  tvl: number;
  proposalsCreated: number;
  proposalsExecuted: number;
  members: number;
}

export interface IDao {
  creatorAddress: Address;
  daoAddress?: Address;
  ens?: string;
  network: SupportedNetworks;
  name: string;
  description: string;
  logo: string;
  createdAt: string;
  governanceId?: string;
  pluginName?: string;
  stats?: IDaoStats;
}
