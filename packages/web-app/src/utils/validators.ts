import {FieldErrors, ValidateResult} from 'react-hook-form';
import {isAddress, parseUnits} from 'ethers/lib/utils';
import {BigNumber, providers as EthersProviders} from 'ethers';
import {InfuraProvider} from '@ethersproject/providers';

import {i18n} from '../../i18n.config';
import {isERC20Token} from './tokens';
import {ALPHA_NUMERIC_PATTERN} from './constants';
import {
  ActionItem,
  Action,
  ActionWithdraw,
  ActionMintToken,
  ActionAddAddress,
  ActionRemoveAddress,
  Nullable,
} from './types';
import {isOnlyWhitespace} from './library';

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
 * Check if the proposal actions screen is valid
 * @param formActions List of actions from the form
 * @param contextActions List of actions from the ActionsContext
 * @param errors List of fields with errors
 * @returns Whether the screen is valid
 */
export function actionsAreValid(
  formActions: Nullable<Action[]>,
  contextActions: ActionItem[],
  errors: FieldErrors
) {
  // proposals can go through without any actions
  if (contextActions?.length === 0) return true;

  // mismatch between action form list and actions context
  if (contextActions.length !== formActions?.length) return false;

  let isValid = false;

  // @Sepehr might need to make affirmative instead at some point - F.F. 2022-08-18
  function actionIsInvalid(index: number) {
    if (errors.actions) return true;
    switch (contextActions[index]?.name) {
      case 'withdraw_assets':
        return (
          (formActions?.[index] as ActionWithdraw)?.to === '' ||
          (formActions?.[index] as ActionWithdraw)?.amount?.toString() === '' ||
          !(formActions?.[index] as ActionWithdraw)?.tokenAddress
        );
      case 'mint_tokens':
        return (
          formActions?.[index] as ActionMintToken
        )?.inputs?.mintTokensToWallets?.some(
          wallet => wallet.address === '' || Number(wallet.amount) === 0
        );

      // check that no address is empty; invalid addresses will be caught by
      // the form specific validator
      case 'add_address':
        return (
          formActions?.[index] as ActionRemoveAddress
        )?.inputs.memberWallets?.some(wallet => wallet.address === '');

      //check whether an address is added to the action
      case 'remove_address':
        return (
          (formActions?.[index] as ActionAddAddress)?.inputs.memberWallets
            ?.length === 0
        );
      default:
        return false;
    }
  }

  for (let i = 0; i < formActions?.length; i++) {
    isValid = !actionIsInvalid(i);
    if (isValid === false) break;
  }

  return isValid;
}

export async function isDaoNameValid(value: string, provider: InfuraProvider) {
  if (isOnlyWhitespace(value)) return i18n.t('errors.required.name');
  try {
    const ensAddress = await provider?.resolveName(value.replaceAll(' ', '_'));
    if (ensAddress) return i18n.t('errors.ensDuplication');
  } catch (err) {
    return i18n.t('errors.ensNetworkIssue');
  }
  return true;
}
