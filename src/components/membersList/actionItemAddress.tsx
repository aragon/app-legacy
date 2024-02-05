/* eslint-disable tailwindcss/no-custom-classname */
import React from 'react';
import styled from 'styled-components';
import {
  useScreen,
  shortenAddress,
  Avatar,
  ButtonIcon,
  Tag,
} from '@aragon/ods-old';
import {Icon, IconType} from '@aragon/ods';
import {DaoMember} from 'utils/paths';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import {useNetwork} from 'context/network';
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
  const navigate = useNavigate();
  const {dao} = useParams();

  const useCompactMode = isCompactMode ?? !isDesktop;
  const enableDelegation =
    featureFlags.getValue('VITE_FEATURE_FLAG_DELEGATION') === 'true';

  const navigateToDaoMember = () => {
    navigate(
      generatePath(DaoMember, {
        network,
        dao,
        user: addressOrEns,
      })
    );
  };

  return (
    <TableRow onClick={navigateToDaoMember}>
      <TableCell>
        <div className="flex flex-row items-center gap-4">
          <Avatar size="small" mode="circle" src={avatar ?? addressOrEns} />
          <div className="flex grow flex-col gap-1">
            <div className="flex flex-row items-start gap-2">
              <div className="font-semibold text-neutral-800 ft-text-base group-hover:text-primary-600">
                {shortenAddress(addressOrEns)}
              </div>
              {walletId && tagLabel && (
                <Tag
                  label={tagLabel}
                  colorScheme={walletId === 'you' ? 'neutral' : 'info'}
                  className="-mt-1"
                />
              )}
            </div>
            {useCompactMode && (
              <div className="flex grow flex-row justify-between text-neutral-600">
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
        <TableCell className="text-neutral-600">
          <MemberVotingPower
            votingPower={votingPower}
            tokenSupply={tokenSupply}
            tokenSymbol={tokenSymbol}
          />
        </TableCell>
      )}

      {!useCompactMode && delegations != null && enableDelegation && (
        <TableCell className="text-neutral-600 ft-text-sm">
          <span>{delegations > 0 ? delegations : ''}</span>
        </TableCell>
      )}

      <TableCell className="flex justify-end gap-x-3">
        {!useCompactMode && (
          <ButtonIcon
            mode="ghost"
            icon={<Icon icon={IconType.CHEVRON_RIGHT} />}
            size="medium"
            bgWhite
            className="group-hover:text-primary-600"
          />
        )}
      </TableCell>
    </TableRow>
  );
};

const TableRow = styled.tr.attrs({
  className:
    'border-b border-b-neutral-100 bg-neutral-0 last:border-neutral-0 hover:cursor-pointer group',
})``;

const TableCell = styled.td.attrs({
  className: 'items-center py-4 px-6 h-full' as string,
})``;
