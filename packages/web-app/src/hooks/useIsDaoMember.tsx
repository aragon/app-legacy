import {BigNumber} from 'ethers';
import {useEffect, useState} from 'react';

import {useNetwork} from 'context/network';
import {fetchBalance} from 'utils/tokens';
import {CHAIN_METADATA} from 'utils/constants';
import {useSpecificProvider} from 'context/providers';
import {isWhitelistMember, useDaoMembers} from './useDaoMembers';
import {HookData} from 'utils/types';

// Hook to determine if connected address is a member of the current
// DAO. Note that ERC20 voting member is anyone holding the token
// and not just those who have previously interacted with the DAO, obviously.
export const useIsDaoMember = (
  dao: string,
  address: string
): HookData<boolean> => {
  const {network} = useNetwork();

  const provider = useSpecificProvider(CHAIN_METADATA[network].id);

  const {data, isLoading, error} = useDaoMembers(dao, address);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    async function checkIfMember() {
      const searchResult = data?.members[0];

      if (address && searchResult) {
        // Whitelist member
        if (isWhitelistMember(searchResult)) {
          setIsMember(searchResult.id === address);
          return;
        }

        // fetch token balance for the address for the
        // ERC20 voting packages just in case this is the first
        // time the address has interacted with the DAO but
        // still holds some of the DAO's tokens.
        if (data?.token?.id) {
          const balance = await fetchBalance(
            data.token.id,
            address,
            provider,
            CHAIN_METADATA[network].nativeCurrency,
            false
          );

          setIsMember(BigNumber.from(balance).gt(0));
          return;
        }
      }
      setIsMember(false);
    }

    checkIfMember();
  }, [address, data, network, provider]);

  return {
    data: isMember,
    isLoading,
    error,
  };
};
