import {Input} from 'utils/types';

export const PAYABLE_VALUE_INPUT_NAME = 'payableEtherValue';

export const PAYABLE_VALUE_INPUT: Input = {
  name: PAYABLE_VALUE_INPUT_NAME,
  type: 'uint256',
  notice: 'ETH value to send with the transaction',
};
