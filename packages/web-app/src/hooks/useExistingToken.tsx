import {useProviders} from 'context/providers';
import {useEffect, useState} from 'react';
import {getDaoTokenOwner} from 'utils/tokens';

type existingTokenType = {
  isTokenMintable: boolean;
};

export const useExistingToken = (
  tokenAddress?: string,
  daoAddress?: string
): existingTokenType => {
  const [isTokenMintable, setIsTokenMintable] = useState(false);
  const {infura: provider} = useProviders();

  useEffect(() => {
    async function fetchTokenOwner() {
      if (!tokenAddress || !daoAddress) return;
      const tokenDaoOwner = await getDaoTokenOwner(tokenAddress, provider);

      setIsTokenMintable(tokenDaoOwner?.toLocaleLowerCase() === daoAddress);
    }

    fetchTokenOwner();
  }, [daoAddress, provider, tokenAddress]);

  return {
    isTokenMintable,
  };
};
