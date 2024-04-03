import {Client} from '@aragon/sdk-client';
import {PluginClient} from 'hooks/usePluginClient';
import {TFunction} from 'i18next';
import {SupportedNetworks} from 'utils/constants';
import {Action, SupportedVotingSettings} from 'utils/types';

export interface IEncodeActionParams {
  client?: Client;
  pluginClient?: PluginClient;
  pluginAddress?: string;
  actions: Action[];
  t: TFunction;
  network: SupportedNetworks;
  daoAddress?: string;
  versions?: [number, number, number];
  votingSettings?: SupportedVotingSettings | null;
}
