import {useProviders} from 'context/providers';
import {useEffect, useState, useMemo} from 'react';
import {getDaoTokenOwner} from 'utils/tokens';
import {useDaoDetailsQuery} from './useDaoDetails';
import {useDaoToken} from './useDaoToken';
import {
  DaoDetails,
  Erc20TokenDetails,
  Erc20WrapperTokenDetails,
} from '@aragon/sdk-client';

export const useExistingToken = ({
  daoDetails,
  daoToken,
}: {
  daoDetails?: DaoDetails | null | undefined;
  daoToken?: Erc20TokenDetails | Erc20WrapperTokenDetails | undefined;
} = {}) => {
  const {infura: provider} = useProviders();
  const {data: daoDetailsFetched} = useDaoDetailsQuery();

  const dao = useMemo(
    () => daoDetails || daoDetailsFetched,
    [daoDetails, daoDetailsFetched]
  );

  const {data: daoTokenFetched} = useDaoToken(
    dao?.plugins?.[0]?.instanceAddress || ''
  );

  const token = useMemo(
    () => daoToken || daoTokenFetched,
    [daoToken, daoTokenFetched]
  );

  const [isDAOTokenWrapped, setIsDAOTokenWrapped] = useState(false);
  const [isTokenMintable, setIsTokenMintable] = useState(false);

  useEffect(() => {
    async function fetchTokenOwner() {
      if (!dao || !token) return;
      const tokenDaoOwner = await getDaoTokenOwner(token.address, provider);

      setIsTokenMintable(tokenDaoOwner?.toLocaleLowerCase() === dao.address);
    }

    fetchTokenOwner();
  }, [dao, provider, token]);

  useEffect(() => {
    if ((token as Erc20WrapperTokenDetails | undefined)?.underlyingToken) {
      setIsDAOTokenWrapped(true);
    }
  }, [token]);

  return {
    isTokenMintable,
    isDAOTokenWrapped,
  };
};
