import {BigNumber} from 'ethers';
import {useEffect, useState} from 'react';

import {useNetwork} from 'context/network';
import {useSpecificProvider} from 'context/providers';
import {CHAIN_METADATA} from 'utils/constants';
import {fetchBalance} from 'utils/tokens';
import {HookData} from 'utils/types';
import {isWhitelistMember, useDaoMembers} from './useDaoMembers';

// NOTE: Temporarily mocking token information, as SDK does not yet expose this.
const token = {
  id: '0x35f7A3379B8D0613c3F753863edc85997D8D0968',
  symbol: 'DTT',
};

// Hook to determine if connected address is eligible to vote on proposals of the current
// DAO. Note that for ERC20, voting member is anyone holding the token
// and not just those who have previously interacted with the DAO, obviously.
// This of course will need to be modified for proper voter eligibility
export const useWalletCanVote = (
  dao: string,
  address: string
): HookData<boolean> => {
  const {network} = useNetwork();

  const provider = useSpecificProvider(CHAIN_METADATA[network].id);

  const {data, isLoading, error} = useDaoMembers(
    dao,
    'addresslistvoting.dao.eth'
  );
  const [canVote, setCanVote] = useState(false);

  useEffect(() => {
    async function checkIfMember() {
      const searchResult = data?.members[0];

      if (address && searchResult) {
        // Whitelist member
        if (isWhitelistMember(searchResult)) {
          setCanVote(searchResult.id === address);
          return;
        }

        // fetch token balance for the address
        // FIXME: this is temporary until we have proper member eligibility for ERC20
        if (token?.id) {
          const balance = await fetchBalance(
            token.id,
            address,
            provider,
            CHAIN_METADATA[network].nativeCurrency,
            false
          );

          setCanVote(BigNumber.from(balance).gt(0));
          return;
        }
      }
      setCanVote(false);
    }

    checkIfMember();
  }, [address, data, network, provider]);

  return {
    data: canVote,
    isLoading,
    error,
  };
};
