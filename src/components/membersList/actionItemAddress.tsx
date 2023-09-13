import React from 'react';
import styled from 'styled-components';
import {
  useScreen,
  shortenAddress,
  Avatar,
  ButtonIcon,
  Dropdown,
  ListItemProps,
  IconLinkExternal,
  IconMenuVertical,
  Tag,
  ListItemAction,
  IconCopy,
} from '@aragon/ods';
import {CHAIN_METADATA} from 'utils/constants';
import {isAddress} from 'viem';
import {useNetwork} from 'context/network';
import {abbreviateTokenAmount} from 'utils/tokens';
import {useAlertContext} from 'context/alert';
import {useTranslation} from 'react-i18next';

/**
 * Type declarations for `ActionItemAddressProps`.
 */
export type ActionItemAddressProps = {
  /** Wallet address or ENS domain name. */
  addressOrEns: string;

  /** Optional ENS avatar URL. If not provided and the wallet address is valid,
   *  it will be used to generate a Blockies avatar.
   */
  avatar?: string;

  /** Number of delegations. */
  delegations?: number;

  /** Optional label for the wallet tag. */
  tagLabel?: string;

  /** Number of tokens delegated. */
  tokenAmount?: number;

  /** Symbol of the token delegated. */
  tokenSymbol?: string;

  /** Total supply of the token */
  tokenSupply?: number;

  /** ID variant for the wallet, which can be 'delegate' or 'you'. */
  walletId?: TagWalletIdProps['variant'];
};

/**
 * `ActionItemAddress` component: Displays an address item with associated actions.
 * @param props - Component properties following `ActionItemAddressProps` type.
 * @returns JSX Element.
 */
export const ActionItemAddress: React.FC<ActionItemAddressProps> = props => {
  const {
    addressOrEns,
    avatar,
    delegations,
    tokenSupply,
    tagLabel,
    tokenAmount,
    tokenSymbol,
    walletId,
  } = props;

  const {isDesktop} = useScreen();
  const {network} = useNetwork();
  const {alert} = useAlertContext();
  const {t} = useTranslation();

  const handleExternalLinkClick = () => {
    const baseUrl = CHAIN_METADATA[network].explorer;
    if (isAddress(addressOrEns)) {
      window.open(baseUrl + '/address/' + addressOrEns, '_blank');
    } else {
      window.open(
        baseUrl + '/enslookup-search?search=' + addressOrEns,
        '_blank'
      );
    }
  };

  const handleCopyAddressClick = () => {
    navigator.clipboard.writeText(addressOrEns);
    alert(t('alert.chip.inputCopied'));
  };

  const menuOptions: ListItemProps[] = [
    {
      component: (
        <ListItemAction
          title="Copy Address"
          iconRight={<IconCopy className="text-ui-300" />}
          onClick={handleCopyAddressClick}
          bgWhite={true}
        />
      ),
    },
    {
      component: (
        <ListItemAction
          title="View on block explorer"
          iconRight={<IconLinkExternal className="text-ui-300" />}
          onClick={handleExternalLinkClick}
          bgWhite={true}
        />
      ),
    },
  ];

  const supplyPercentage =
    tokenSupply && tokenAmount
      ? ((tokenAmount / tokenSupply) * 100).toFixed(2)
      : undefined;

  const parsedTokenAmount = abbreviateTokenAmount(
    tokenAmount?.toString() ?? '0'
  );

  return (
    <tr className="bg-ui-0 border-b last:border-ui-0 border-b-ui-100">
      <TableCell>
        <div className="flex flex-row gap-2 items-center">
          <Avatar size="small" mode="circle" src={avatar ?? addressOrEns} />
          <div className="flex flex-row gap-1 items-start">
            <div className="font-semibold text-ui-800 ft-text-base">
              {shortenAddress(addressOrEns)}
            </div>
            {walletId && tagLabel && (
              <TagWalletId
                label={tagLabel}
                variant={walletId}
                className="inline-flex relative -top-0.5 -right-0.5"
              />
            )}
          </div>
        </div>
      </TableCell>

      {isDesktop && tokenAmount && tokenSymbol && (
        <TableCell className="text-ui-600">
          <div className="flex flex-row gap-0.5 items-center">
            <div className="flex flex-row gap-0.25 font-semibold ft-text-sm">
              <span>{parsedTokenAmount}</span>
              <span>{tokenSymbol}</span>
            </div>
            <span className="ft-text-xs">({supplyPercentage}%)</span>
          </div>
        </TableCell>
      )}

      {isDesktop && delegations != null && (
        <TableCell className="text-ui-600 ft-text-sm">
          <span>{delegations > 0 ? delegations : ''}</span>
        </TableCell>
      )}

      <TableCell className="flex gap-x-1.5 justify-end">
        {isDesktop && (
          <ButtonIcon
            mode="ghost"
            icon={<IconLinkExternal />}
            size="small"
            bgWhite
            onClick={handleExternalLinkClick}
          />
        )}

        <Dropdown
          align="end"
          className="py-1 px-0"
          listItems={menuOptions}
          side="bottom"
          trigger={
            <ButtonIcon
              mode="secondary"
              icon={<IconMenuVertical />}
              size="small"
              bgWhite
            />
          }
        />
      </TableCell>
    </tr>
  );
};

export const TAG_WALLET_ID_VARIANTS = ['delegate', 'you'] as const;
type TagWalletIdVariant = typeof TAG_WALLET_ID_VARIANTS[number];

/**
 * Type declarations for `TagWalletIdProps`.
 */
type TagWalletIdProps = {
  /** Optional CSS classes to apply to the tag. */
  className?: string;
  /** Label to display on the tag. */
  label: string;
  /** Variant of the tag which affects its color. Can be 'delegate' or 'you'. */
  variant: TagWalletIdVariant;
};

/**
 * `TagWalletId` component: Displays a styled tag based on the provided variant.
 * @param props - Component properties following `TagWalletIdProps` type.
 * @returns JSX Element.
 */
const TagWalletId: React.FC<TagWalletIdProps> = ({
  className,
  label,
  variant,
}) => {
  const colorScheme = variant === 'you' ? 'neutral' : 'info';
  return <Tag label={label} colorScheme={colorScheme} className={className} />;
};

const TableCell = styled.td.attrs({
  className: 'py-2 px-3' as string,
})``;
