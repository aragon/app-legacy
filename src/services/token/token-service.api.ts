import {AssetBalance} from '@aragon/sdk-client';
import {SupportedNetworks} from 'utils/constants';

export interface IFetchTokenParams {
  address: string;
  network: SupportedNetworks;
  symbol?: string;
}

export interface IFetchTokenBalancesParams {
  address: string;
  network: SupportedNetworks;
  ignoreZeroBalances?: boolean;
  nativeTokenBalance?: bigint;
}

export interface IFetchTokenTransfersParams {
  address: string;
  network: SupportedNetworks;
  assets: AssetBalance[];
}

export type FetchErc20DepositParams = Omit<
  IFetchTokenTransfersParams,
  'assets'
>;
