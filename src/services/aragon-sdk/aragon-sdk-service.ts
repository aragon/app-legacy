import {TokenVotingClient, DelegateTokensStepValue} from '@aragon/sdk-client';
import {
  IDelegateTokensParams,
  IFetchDelegateeParams,
} from './aragon-sdk-service.api';
import {invariant} from 'utils/invariant';

class AragonSdkService {
  fetchDelegatee = async (
    params: IFetchDelegateeParams,
    client?: TokenVotingClient
  ): Promise<string | null> => {
    invariant(client != null, 'fetchDelegatee: client is not defined');
    const data = await client.methods.getDelegatee(params.tokenAddress);

    return data;
  };

  delegateTokens = async (
    params: IDelegateTokensParams,
    client?: TokenVotingClient
  ): Promise<AsyncGenerator<DelegateTokensStepValue>> => {
    invariant(client != null, 'delegateTokens: client is not defined');
    const data = client.methods.delegateTokens(params);

    return data;
  };
}

export const aragonSdkService = new AragonSdkService();
