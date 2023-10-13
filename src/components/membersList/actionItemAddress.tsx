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
  IconGovernance,
} from '@aragon/ods-old';
import {CHAIN_METADATA} from 'utils/constants';
import {isAddress} from 'viem';
import {useNetwork} from 'context/network';
import {useAlertContext} from 'context/alert';
import {useTranslation} from 'react-i18next';
import {useGlobalModalContext} from 'context/globalModals';
import {useAccount} from 'wagmi';
import {MemberVotingPower} from './memberVotingPower';
import {featureFlags} from 'utils/featureFlags';

/**
 * Type declarations for `ActionItemAddressProps`.
 */
export type ActionItemAddressProps = {
  /** Defines if the address is member of a token-based DAO or not  */
  isTokenDaoMember?: boolean;

  /** Does not render some member information on compact mode */
  isCompactMode?: boolean;

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

  /** Voting power of the member. */
  votingPower?: number;

  /** Symbol of the token delegated. */
  tokenSymbol?: string;

  /** Total supply of the token */
  tokenSupply?: number;

  /** ID variant for the wallet, which can be 'delegate' or 'you'. */
  walletId?: 'delegate' | 'you';
};

/**
 * `ActionItemAddress` component: Displays an address item with associated actions.
 * @param props - Component properties following `ActionItemAddressProps` type.
 * @returns JSX Element.
 */
export const ActionItemAddress: React.FC<ActionItemAddressProps> = props => {
  const {
    isTokenDaoMember,
    isCompactMode,
    addressOrEns,
    avatar,
    delegations,
    tokenSupply,
    tagLabel,
    votingPower,
    tokenSymbol,
    walletId,
  } = props;

  const {isDesktop} = useScreen();
  const {network} = useNetwork();
  const {address} = useAccount();
  const {alert} = useAlertContext();
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();

  const useCompactMode = isCompactMode ?? !isDesktop;
  const enableDelegation =
    featureFlags.getValue('VITE_FEATURE_FLAG_DELEGATION') === 'true';

  const handleExternalLinkClick = () => {
    const baseUrl = CHAIN_METADATA[network].explorer;
    if (isAddress(addressOrEns)) {
      window.open(baseUrl + 'address/' + addressOrEns, '_blank');
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

  const handleDelegateClick = () => {
    const modalState =
      walletId === 'delegate' ? {reclaimMode: true} : {delegate: addressOrEns};
    // Note: By using the current implementation of the Dropdown menu, the dialog gets
    // opened and immediately closed without a setTimeout call. This will be analysed and
    // fixed with the new Dropdown implementation of the @aragon/ods library.
    setTimeout(() => open('delegateVoting', modalState), 1);
  };

  const buildMenuOptions = () => {
    const menuOptions: ListItemProps[] = [
      {
        callback: handleCopyAddressClick,
        component: (
          <ListItemAction
            title={t('community.actionItemDropdown.optionCopyAddress')}
            iconRight={<IconCopy className="text-ui-300" />}
            bgWhite={true}
          />
        ),
      },
      {
        callback: handleExternalLinkClick,
        component: (
          <ListItemAction
            title={t('community.actionItemDropdown.optionBlockExplorer')}
            iconRight={<IconLinkExternal className="text-ui-300" />}
            bgWhite={true}
          />
        ),
      },
    ];

    const delegateOption: ListItemProps = {
      callback: handleDelegateClick,
      component: (
        <ListItemAction
          title={
            walletId === 'delegate'
              ? t('community.actionItemDropdown.optionUndelegate')
              : t('community.actionItemDropdown.optionDelegate')
          }
          iconRight={<IconGovernance className="text-ui-300" />}
          bgWhite={true}
        />
      ),
    };

    const isConnectedAddress =
      address?.toLowerCase() === addressOrEns.toLowerCase();

    return isTokenDaoMember && !isConnectedAddress && enableDelegation
      ? menuOptions.concat(delegateOption)
      : menuOptions;
  };

  return (
    <tr className="border-b border-b-ui-100 bg-ui-0 last:border-ui-0">
      <TableCell>
        <div className="flex flex-row items-center gap-2">
          <Avatar size="small" mode="circle" src={avatar ?? addressOrEns} />
          <div className="flex grow flex-col gap-0.5">
            <div className="flex flex-row items-start gap-1">
              <div className="font-semibold text-ui-800 ft-text-base">
                {shortenAddress(addressOrEns)}
              </div>
              {walletId && tagLabel && (
                <Tag
                  label={tagLabel}
                  colorScheme={walletId === 'you' ? 'neutral' : 'info'}
                  className="-mt-0.5"
                />
              )}
            </div>
            {useCompactMode && (
              <div className="flex grow flex-row justify-between text-ui-600">
                <MemberVotingPower
                  votingPower={votingPower}
                  tokenSupply={tokenSupply}
                  tokenSymbol={tokenSymbol}
                />
                {(delegations ?? 0) > 0 && enableDelegation && (
                  <div className="ft-text-sm">
                    <span>{delegations} Delegations</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </TableCell>

      {!useCompactMode && votingPower != null && tokenSymbol && (
        <TableCell className="text-ui-600">
          <MemberVotingPower
            votingPower={votingPower}
            tokenSupply={tokenSupply}
            tokenSymbol={tokenSymbol}
          />
        </TableCell>
      )}

      {!useCompactMode && delegations != null && enableDelegation && (
        <TableCell className="text-ui-600 ft-text-sm">
          <span>{delegations > 0 ? delegations : ''}</span>
        </TableCell>
      )}

      <TableCell className="flex justify-end gap-x-1.5">
        {!useCompactMode && (
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
          className="px-0 py-1"
          listItems={buildMenuOptions()}
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

const TableCell = styled.td.attrs({
  className: 'items-center py-2 px-3 h-full' as string,
})``;
