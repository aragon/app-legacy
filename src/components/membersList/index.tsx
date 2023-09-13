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
import {useScreen} from '@aragon/ods';

type MembersListProps = {
  members: DaoMember[];
  token?: Erc20TokenDetails;
};

export const MembersList: React.FC<MembersListProps> = ({token, members}) => {
  const [totalSupply, setTotalSupply] = useState<number>(0);

  const {network} = useNetwork();
  const {api: provider} = useProviders();
  const {address} = useAccount();
  const {isDesktop} = useScreen();

  const isTokenBasedDao = token != null;

  useEffect(() => {
    async function fetchTotalSupply() {
      if (provider && token) {
        const {totalSupply: supply, decimals} = await getTokenInfo(
          token.address,
          provider,
          CHAIN_METADATA[network].nativeCurrency
        );
        setTotalSupply(Number(formatUnits(supply, decimals)));
      }
    }
    fetchTotalSupply();
  }, [provider, token, network]);

  const getMemberId = (member: DaoMember) => {
    if (member.address.toLowerCase() === address?.toLowerCase()) {
      return {walletId: 'you' as const, tagLabel: 'You'};
    }

    if (
      isTokenDaoMember(member) &&
      member.delegatee.toLowerCase() === address?.toLowerCase()
    ) {
      return {walletId: 'delegate' as const, tagLabel: 'Delegate'};
    }

    return undefined;
  };

  return (
    <table className="overflow-hidden w-full rounded-xl">
      {isDesktop && (
        <thead>
          <tr className="text-ui-600 bg-ui-0 border-b border-b-ui-100">
            <TableCellHead>Member</TableCellHead>
            {isDesktop && isTokenBasedDao && (
              <TableCellHead>Voting power</TableCellHead>
            )}
            {isDesktop && isTokenBasedDao && (
              <TableCellHead>Delegations</TableCellHead>
            )}
            <TableCellHead />
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
              tokenAmount={member.balance}
              tokenSymbol={token?.symbol}
              tokenSupply={totalSupply}
              {...getMemberId(member)}
            />
          ) : (
            <ActionItemAddress
              key={member.address}
              addressOrEns={member.address}
            />
          )
        )}
      </tbody>
    </table>
  );
};

const TableCellHead = styled.td.attrs({
  className: 'text-left px-3 py-2',
})``;
