import {ListItemAddress} from '@aragon/ods';
import {Erc20TokenDetails} from '@aragon/sdk-client';
import {formatUnits, isAddress} from 'ethers/lib/utils';
import React, {useEffect, useState} from 'react';

import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {DaoMember, isTokenDaoMember} from 'hooks/useDaoMembers';
import {CHAIN_METADATA} from 'utils/constants';
import {getTokenInfo} from 'utils/tokens';
import {ActionItemAddress} from './actionItemAddress';
import {useAccount} from 'wagmi';

type MembersListProps = {
  members: DaoMember[];
  token?: Erc20TokenDetails;
};

export const MembersList: React.FC<MembersListProps> = ({token, members}) => {
  const [totalSupply, setTotalSupply] = useState<number>(0);

  const {network} = useNetwork();
  const {api: provider} = useProviders();
  const {address} = useAccount();

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

  const itemClickHandler = (address: string) => {
    const baseUrl = CHAIN_METADATA[network].explorer;
    if (isAddress(address))
      window.open(baseUrl + '/address/' + address, '_blank');
    else window.open(baseUrl + '/enslookup-search?search=' + address, '_blank');
  };

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
    <div>
      {members.map(member =>
        isTokenDaoMember(member) ? (
          <ActionItemAddress
            key={member.address}
            addressOrEns={member.address}
            delegations={member.delegators.length}
            tokenAmount={member.balance}
            tokenSymbol={token?.symbol}
            tokenSupply={totalSupply}
            menuOptions={[]}
            {...getMemberId(member)}
          />
        ) : (
          <ActionItemAddress
            key={member.address}
            addressOrEns={member.address}
          />
        )
      )}
    </div>
  );

  return (
    <>
      {members.map(member => (
        <ListItemAddress
          // won't allow key in the objects for whatever reason
          key={member.address}
          label={member.address}
          src={member.address}
          onClick={() => itemClickHandler(member.address)}
          {...(isTokenDaoMember(member)
            ? {
                tokenInfo: {
                  amount: member.balance,
                  symbol: token?.symbol || '',
                  percentage: totalSupply
                    ? Number(((member.balance / totalSupply) * 100).toFixed(2))
                    : '-',
                },
              }
            : {})}
        />
      ))}
    </>
  );
};
