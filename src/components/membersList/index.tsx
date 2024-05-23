import {Erc20TokenDetails} from '@aragon/sdk-client';
import {formatUnits} from 'ethers/lib/utils';
import React, {useEffect, useState} from 'react';
import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {DaoMember, isTokenDaoMember} from 'hooks/useDaoMembers';
import {CHAIN_METADATA} from 'utils/constants';
import {getTokenInfo} from 'utils/tokens';
import {ActionItemAddress} from './actionItemAddress';
import {useAccount} from 'wagmi';
import styled from 'styled-components';
import {useScreen} from '@aragon/ods-old';
import {useTranslation} from 'react-i18next';
import {featureFlags} from 'utils/featureFlags';
import {useGaslessGovernanceEnabled} from '../../hooks/useGaslessGovernanceEnabled';

type MembersListProps = {
  members: DaoMember[];
  token?: Erc20TokenDetails;
  vocdoni?: boolean;
  isCompactMode?: boolean;
};

export const MembersList: React.FC<MembersListProps> = ({
  token,
  members,
  isCompactMode,
}) => {
  const [totalSupply, setTotalSupply] = useState<number>(0);

  const {network} = useNetwork();
  const {api: provider} = useProviders();
  const {address} = useAccount();
  const {isDesktop} = useScreen();
  const {t} = useTranslation();

  // Gasless voting plugin support non wrapped tokens
  // Used to hide delegation column in case of gasless voting plugin
  const {isGovernanceEnabled} = useGaslessGovernanceEnabled();

  const isTokenBasedDao = token != null;
  const useCompactMode = isCompactMode ?? !isDesktop;
  const enableDelegation =
    featureFlags.getValue('VITE_FEATURE_FLAG_DELEGATION') === 'true';

  useEffect(() => {
    async function fetchTotalSupply() {
      if (provider && token) {
        const {totalSupply: supply, decimals} = await getTokenInfo(
          token.address,
          provider,
          CHAIN_METADATA[network].nativeCurrency
        );
        console.log('supply', supply);
        setTotalSupply(Number(formatUnits(supply, decimals)));
      }
    }
    fetchTotalSupply();
  }, [provider, token, network]);

  const getMemberId = (member: DaoMember) => {
    if (member.address.toLowerCase() === address?.toLowerCase()) {
      return {walletId: 'you' as const, tagLabel: t('tagWallet.labelYou')};
    }

    if (
      isTokenDaoMember(member) &&
      member.delegators.some(
        delegator => delegator.toLowerCase() === address?.toLowerCase()
      )
    ) {
      return {
        walletId: 'delegate' as const,
        tagLabel: t('tagWallet.labelYourDelegate'),
      };
    }

    return undefined;
  };

  if (members.length === 0) {
    return null;
  }

  const showDelegationHeaders =
    isDesktop && isTokenBasedDao && enableDelegation;

  return (
    <div
      className={`overflow-hidden rounded-xl ${
        useCompactMode ? 'border border-neutral-100' : ''
      } `}
    >
      <table className="h-full w-full">
        {!useCompactMode && (
          <thead>
            <tr className="border-b border-b-neutral-100 bg-neutral-0 text-neutral-600">
              <TableCellHead>{t('community.listHeader.member')}</TableCellHead>
              {isDesktop && isTokenBasedDao && (
                <TableCellHead>
                  {t('community.listHeader.votingPower')}
                </TableCellHead>
              )}
              <TableCellHead>
                {showDelegationHeaders && isGovernanceEnabled && (
                  <>{t('community.listHeader.delegations')}</>
                )}
              </TableCellHead>
              {showDelegationHeaders && <TableCellHead />}
              {!isTokenBasedDao && <TableCellHead />}
            </tr>
          </thead>
        )}
        <tbody>
          {members.map(member =>
            isTokenDaoMember(member) ? (
              <ActionItemAddress
                key={member.address}
                addressOrEns={member.address}
                delegations={member.delegators.length}
                votingPower={member.votingPower}
                tokenSymbol={token?.symbol}
                tokenSupply={totalSupply}
                isTokenDaoMember={true}
                isCompactMode={isCompactMode}
                {...getMemberId(member)}
              />
            ) : (
              <ActionItemAddress
                key={member.address}
                addressOrEns={member.address}
                isCompactMode={isCompactMode}
              />
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

const TableCellHead = styled.td.attrs({
  className: 'text-left  px-6 py-4',
})``;
