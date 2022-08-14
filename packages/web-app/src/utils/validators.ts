import {ValidateResult} from 'react-hook-form';
import {isAddress, parseUnits} from 'ethers/lib/utils';
import {BigNumber, providers as EthersProviders} from 'ethers';

import {i18n} from '../../i18n.config';
import {isERC20Token} from './tokens';
import {ALPHA_NUMERIC_PATTERN} from './constants';
import {
  ActionItem,
  Action,
  StringIndexed,
  ActionWithdraw,
  ActionTokenMinting,
} from './types';

/**
 * Validate given token contract address
 *
 * @param address token contract address
 * @param provider rpc provider
 * @returns true when valid, or an error message when invalid
 */
export async function validateTokenAddress(
  address: string,
  provider: EthersProviders.Provider
): Promise<ValidateResult> {
  const result = validateAddress(address);

  if (result === true) {
    return (await isERC20Token(address, provider))
      ? true
      : (i18n.t('errors.notERC20Token') as string);
  } else {
    return result;
  }
}

/**
 * Validate given token amount
 *
 * @param amount token amount
 * @param decimals token decimals
 * @param balance optional balance to verify against
 * @returns true when valid, or an error message when invalid
 */
export function validateTokenAmount(
  amount: string,
  decimals: number,
  balance = ''
) {
  // A token with no decimals (they do exist in the wild)
  if (!decimals) {
    return amount.includes('.')
      ? (i18n.t('errors.includeExactAmount') as string)
      : true;
  }

  // Number of characters after decimal point greater than
  // the number of decimals in the token itself
  if (amount.split('.')[1]?.length > decimals)
    return i18n.t('errors.exceedsFractionalParts', {decimals}) as string;

  // Amount less than or equal to zero
  if (BigNumber.from(parseUnits(amount, decimals)).lte(0))
    return i18n.t('errors.lteZero') as string;

  if (balance !== '') {
    if (BigNumber.from(parseUnits(amount, decimals)).gt(parseUnits(balance)))
      // Amount is greater than wallet/dao balance
      return i18n.t('errors.insufficientBalance') as string;
  }

  return true;
}

/**
 * Validate given wallet address
 *
 * @param address address to be validated
 * @returns true if valid, error message if invalid
 */
export const validateAddress = (address: string): ValidateResult => {
  return isAddress(address)
    ? true
    : (i18n.t('errors.invalidAddress') as string);
};

/**
 * Check if given string is a valid alpha-numeric string
 *
 * @param value value to be validated
 * @param field name of field to be validated
 * @returns true if valid, error message if invalid
 */
export const alphaNumericValidator = (
  value: string,
  field = 'Field'
): ValidateResult => {
  return new RegExp(ALPHA_NUMERIC_PATTERN).test(value)
    ? true
    : (i18n.t('errors.onlyAlphaNumeric', {field}) as string);
};

/**
 * Check if the screen is valid
 * @param errors List of fields with errors
 * @returns Whether the screen is valid
 */
export function actionsAreValid(
  actionFormList: Action[],
  actions: ActionItem[],
  errors: StringIndexed
) {
  let result = false;
  function isActionNotValid(index: number) {
    if (errors.actions) return true;
    switch (actions[0]?.name) {
      case 'withdraw_assets':
        return (
          (actionFormList[index] as ActionWithdraw)?.to === '' ||
          (actionFormList[index] as ActionWithdraw)?.amount?.toString() === ''
        );
      case 'mint_token':
        return (
          actionFormList[index] as ActionTokenMinting
        )?.inputs?.mintTokensToWallets?.some(wallet => wallet.address === '');
      default:
        return false;
    }
  }

  for (let i = 0; i < actionFormList?.length; i++) {
    if (isActionNotValid(i)) {
      result = false;
      break;
    } else {
      result = true;
    }
  }
  if (actions?.length === 0) return true;
  if (actions.length !== actionFormList.length) return false;
  return result;
}
