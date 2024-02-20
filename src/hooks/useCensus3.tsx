import {useClient} from '@vocdoni/react-providers';
import {useCallback, useEffect, useState} from 'react';
import {
  GaslessPluginName,
  PluginTypes,
  usePluginClient,
} from './usePluginClient';
import {Token, ErrTokenAlreadyExists} from '@vocdoni/sdk';
import {useParams} from 'react-router-dom';
import {useProposal} from '../services/aragon-sdk/queries/use-proposal';
import {GaslessVotingProposal} from '@vocdoni/gasless-voting';
import {DaoMember, TokenDaoMember} from './useDaoMembers';
import {
  getCensus3VotingPowerByCensusId,
  getCensus3VotingPowerByTokenAddress,
} from '../utils/tokens';
import {Erc20TokenDetails, Erc20WrapperTokenDetails} from '@aragon/sdk-client';
import {useWallet} from './useWallet';

const CENSUS3_URL = 'https://census3-stg.vocdoni.net/api';

export const useCensus3Client = () => {
  const {census3} = useClient();
  census3.url = CENSUS3_URL;
  return census3;
};

/**
 * Hook to know if the actual wallet chain id is supported by the census3 vocdoni service
 */
export const useCensus3SupportedChains = (chainId: number) => {
  const census3 = useCensus3Client();
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    (async () => {
      if (chainId && census3) {
        const supported = (await census3.getSupportedChains())
          .map(chain => chain.chainID)
          .includes(chainId);
        setIsSupported(supported);
      }
    })();
  }, [census3, chainId]);

  return isSupported;
};

export const useCensus3CreateToken = ({chainId}: {chainId: number}) => {
  const client = usePluginClient(GaslessPluginName);
  const census3 = useCensus3Client();
  const isSupported = useCensus3SupportedChains(chainId);

  const createToken = useCallback(
    async (pluginAddress: string) => {
      if (!isSupported) throw Error('ChainId is not supported');
      // Check if the census is already sync
      try {
        const token = await client?.methods.getToken(pluginAddress);
        if (!token) throw Error('Cannot retrieve the token');
        await census3.createToken(token.address, 'erc20', chainId, undefined, [
          'aragon',
          'dao',
        ]);
      } catch (e) {
        if (!(e instanceof ErrTokenAlreadyExists)) {
          throw e;
        }
      }
    },
    [census3, chainId, client?.methods, isSupported]
  );

  return {createToken};
};

// Hook that return census3 census id if is gasless plugin
export const useGaslessCensusId = ({
  pluginType,
  enable = true,
}: {
  pluginType: PluginTypes;
  enable?: boolean;
}) => {
  const {dao, id: proposalId} = useParams();

  const isGasless = pluginType === GaslessPluginName;
  const _enable: boolean = enable && !!dao && !!proposalId && isGasless;

  const {data: proposalData} = useProposal(
    {
      pluginType: pluginType,
      id: proposalId ?? '',
    },
    {
      enabled: _enable,
    }
  );

  let censusId: string | null = null;
  let censusSize: number | null = null;
  if (
    _enable &&
    proposalData &&
    (proposalData as GaslessVotingProposal).vochain
  ) {
    const census = (proposalData as GaslessVotingProposal).vochain.metadata
      .census;
    censusId = census.censusId;
    censusSize = census.size;
  }

  return {censusId, censusSize};
};

/**
 * Get member balance from vocdoni census3. It accepts a census id or a token id to retrieve the voting power
 * @param holders list of members to get the balance
 * @param isGovernanceEnabled
 * @param censusId
 * @param tokenId
 */
export const useNonWrappedDaoMemberBalance = ({
  holders,
  isGovernanceEnabled,
  censusId,
  tokenId,
}: {
  holders: TokenDaoMember[];
  isGovernanceEnabled: boolean;
  censusId?: string | null;
  tokenId?: string;
}) => {
  // State to store DaoMembers[]
  const [members, setMembers] = useState<DaoMember[]>(holders);
  const {client: vocdoniClient} = useClient();
  const census3 = useCensus3Client();
  const {chainId} = useWallet();

  // todo(kon): use a query
  useEffect(() => {
    if (vocdoniClient && isGovernanceEnabled && (censusId || tokenId)) {
      (async () => {
        const members = await Promise.all(
          holders.map(async member => {
            let votingPower: string | bigint = '0';
            if (censusId) {
              votingPower = await getCensus3VotingPowerByCensusId(
                vocdoniClient,
                member.address,
                censusId
              );
            } else if (tokenId) {
              votingPower = await getCensus3VotingPowerByTokenAddress(
                census3,
                tokenId,
                chainId,
                member.address
              );
            }
            member.balance = Number(votingPower);
            member.votingPower = Number(votingPower);
            return member;
          })
        );
        setMembers(members);
      })();
    }
  }, [
    census3,
    censusId,
    chainId,
    holders,
    isGovernanceEnabled,
    members,
    tokenId,
    vocdoniClient,
  ]);

  return {members};
};

/**
 * Hook to fetch token information using census3.getToken function
 */
export const useCensus3Token = ({
  pluginType,
  daoToken,
  enable,
}: {
  pluginType: PluginTypes;
  daoToken: Erc20TokenDetails | Erc20WrapperTokenDetails | undefined;
  enable?: boolean;
}) => {
  const census3 = useCensus3Client();
  const {chainId} = useWallet();
  const [token, setToken] = useState<Token>();
  const isGasless = pluginType === GaselessPluginName;

  useEffect(() => {
    (async () => {
      if (enable && isGasless && daoToken) {
        const token = await census3.getToken(daoToken.address, chainId);
        setToken(token);
      }
    })();
  }, [census3, daoToken, chainId, enable, isGasless]);

  return {token};
};
