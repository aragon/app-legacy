import {useProviders} from 'context/providers';
import {useEffect, useState, useMemo} from 'react';
import {getDaoTokenOwner} from 'utils/tokens';
import {useDaoDetailsQuery} from './useDaoDetails';
import {useDaoToken} from './useDaoToken';
import {
  DaoDetails,
  Erc20TokenDetails,
  Erc20WrapperTokenDetails,
  TokenVotingClient,
} from '@aragon/sdk-client';
import {validateGovernanceTokenAddress} from 'utils/validators';
import {
  isGaslessVotingClient,
  PluginTypes,
  usePluginClient,
} from './usePluginClient';
import {useGaslessGovernanceEnabled} from './useGaslessGovernanceEnabled';

export const useExistingToken = ({
  daoDetails,
  daoToken,
}: {
  daoDetails?: DaoDetails | null | undefined;
  daoToken?: Erc20TokenDetails | Erc20WrapperTokenDetails | undefined;
} = {}) => {
  const {api: provider} = useProviders();
  const {data: daoDetailsFetched} = useDaoDetailsQuery();
  const {isGovernanceEnabled} = useGaslessGovernanceEnabled();

  const dao = useMemo(
    () => daoDetails || daoDetailsFetched,
    [daoDetails, daoDetailsFetched]
  );

  const {data: daoTokenFetched} = useDaoToken(
    dao?.plugins?.[0]?.instanceAddress || ''
  );

  const {id: pluginType} = daoDetails?.plugins[0] || {};
  const pluginClient = usePluginClient(pluginType as PluginTypes);

  const token = useMemo(
    () => daoToken || daoTokenFetched,
    [daoToken, daoTokenFetched]
  );

  const [isDAOTokenWrapped, setIsDAOTokenWrapped] = useState(false);
  const [isTokenMintable, setIsTokenMintable] = useState(false);

  useEffect(() => {
    async function isTokenMintable() {
      if (!dao || !token || !pluginClient) return;
      if (isGaslessVotingClient(pluginClient)) {
        setIsTokenMintable(isGovernanceEnabled);
        return;
      }
      const tokenDaoOwner = await getDaoTokenOwner(token.address, provider);

      setIsTokenMintable(tokenDaoOwner?.toLocaleLowerCase() === dao.address);
    }

    void isTokenMintable();
  }, [dao, isGovernanceEnabled, pluginClient, provider, token]);

  useEffect(() => {
    async function detectWhetherGovTokenIsWrapped(
      token: Erc20WrapperTokenDetails | undefined
    ) {
      if (!token || !pluginClient) return;
      if (isGaslessVotingClient(pluginClient)) {
        setIsTokenMintable(isGovernanceEnabled);
        return;
      }

      let tokenType = '';
      const isUnderlyingTokenExists = !!token.underlyingToken;

      if (isUnderlyingTokenExists) {
        const {type} = await validateGovernanceTokenAddress(
          token.underlyingToken.address,
          provider,
          pluginClient as TokenVotingClient
        );

        tokenType = type;
      }

      setIsDAOTokenWrapped(
        tokenType !== 'governance-ERC20' && isUnderlyingTokenExists
      );
    }

    detectWhetherGovTokenIsWrapped(
      token as Erc20WrapperTokenDetails | undefined
    );
  }, [isGovernanceEnabled, pluginClient, provider, token]);

  return {
    isTokenMintable,
    isDAOTokenWrapped,
  };
};
