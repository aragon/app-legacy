// Library utils / Ethers for now
import {BigNumberish, constants, ethers} from 'ethers';
import {TFunction} from 'react-i18next';

export function formatUnits(amount: BigNumberish, decimals: number) {
  if (amount.toString().includes('.') || !decimals) {
    return amount.toString();
  }
  return ethers.utils.formatUnits(amount, decimals);
}

// (Temporary) Should be moved to ui-component perhaps
/**
 * Handles copying and pasting to and from the clipboard respectively
 * @param currentValue field value
 * @param onChange on value change callback
 */
export async function handleClipboardActions(
  currentValue: string,
  onChange: (value: string) => void
) {
  if (currentValue) {
    await navigator.clipboard.writeText(currentValue);

    // TODO: change to proper mechanism
    alert('Copied');
  } else {
    const textFromClipboard = await navigator.clipboard.readText();
    onChange(textFromClipboard);
  }
}

/**
 * Check if the given value is an empty string
 * @param value parameter
 * @returns whether the parameter is an empty string
 */
export const isOnlyWhitespace = (value: string) => {
  return value.trim() === '';
};

/**
 * Return user friendly wallet address label if available
 * @param value address
 * @param t translation function
 * @returns user friendly label or wallet address
 */
export const getUserFriendlyWalletLabel = (
  value: string,
  t: TFunction<'translation', undefined>
) => {
  switch (value) {
    case '':
      return '';
    case constants.AddressZero:
      return t('labels.daoTreasury');

    default:
      return value;
  }
};

export const toHex = (num: number | string) => {
  return '0x' + num.toString(16);
};
