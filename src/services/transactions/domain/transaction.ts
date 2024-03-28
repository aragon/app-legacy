import {BigNumber} from 'ethers';
import {Address, Hash} from 'viem';

export interface ITransaction {
  to: Address;
  from?: Address;
  nonce?: number;

  gasLimit?: BigNumber;

  data?: Hash;
  value?: bigint;
  chainId?: number;
}
