import {FieldError, FieldErrors, ValidateResult} from 'react-hook-form';
import {isAddress, parseUnits} from 'ethers/lib/utils';
import {BigNumber, providers as EthersProviders} from 'ethers';
import {InfuraProvider} from '@ethersproject/providers';

import {i18n} from '../../i18n.config';
import {isERC20Token} from './tokens';
import {
  ALPHA_NUMERIC_PATTERN,
  CHAIN_METADATA,
  SupportedNetworks,
} from './constants';
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

export function isDaoEnsNameValid(
  value: string,
  provider: InfuraProvider,
  setError: (name: string, error: FieldError) => void,
  clearError: (name?: string | string[]) => void,
  getValues: (payload?: string | string[]) => Object
) {
  if (isOnlyWhitespace(value)) return i18n.t('errors.required.name');
  if (value.length > 128) return i18n.t('errors.ensNameLength');

  const pattern = /^[a-z0-9-]+$/;
  if (!pattern.test(value)) return i18n.t('errors.ensNameInvalidFormat');

  // some networks like Arbitrum Goerli and other L2s do not support ENS domains as of now
  // don't check and allow name collision failure to happen when trying to run transaction
  if (!provider.network.ensAddress) {
    console.warn(
      `Unable to verify DAO ens name: ${provider.network.name} does not support ENS domains`
    );
    return true;
  }

  // We might need to combine the method with setTimeout (Similar to useDebouncedState)
  // for better performance
  try {
    provider?.resolveName(`${value}.dao.eth`).then(result => {
      const inputValue = getValues('daoEnsName');
      // Check to see if the response belongs to current value
      if (value === inputValue) {
        if (result) {
          setError('daoEnsName', {
            type: 'validate',
            message: i18n.t('errors.ensDuplication'),
          });
        } else clearError();
      }
    });

    return i18n.t('infos.checkingEns');

    // clear errors will show the available message and enable the next button
  } catch (err) {
    return i18n.t('errors.ensNetworkIssue') as string;
  }
}

// FIXME: For some chains like polygon we might need different api key
export async function validateContract(
  address: string,
  networks: SupportedNetworks
) {
  const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY;
  const url = `${CHAIN_METADATA[networks].etherscanApi}?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    // status 1 means that the etherscan response was successful
    if (data.status === '1')
      if (data.result[0].ABI !== 'Contract source code not verified')
        // The API works with no api key as well but this condition will check
        // the abi and api key existence with the same condition
        return data.result[0];
  } catch (error) {
    console.log(error);
  }
}
