import {useMutation, UseMutationOptions} from '@tanstack/react-query';
import {IDelegateTokensParams} from '../aragon-sdk-service.api';
import {usePluginClient} from 'hooks/usePluginClient';
import {DelegateTokensStepValue, TokenVotingClient} from '@aragon/sdk-client';
import {invariant} from 'utils/invariant';

const delegateTokens = async (
  params: IDelegateTokensParams,
  client?: TokenVotingClient
): Promise<AsyncGenerator<DelegateTokensStepValue>> => {
  invariant(client != null, 'delegateTokens: client is not defined');
  const data = client.methods.delegateTokens(params);

  return data;
};

export const useDelegateTokens = (
  options?: UseMutationOptions<
    AsyncGenerator<DelegateTokensStepValue>,
    unknown,
    IDelegateTokensParams
  >
) => {
  const client = usePluginClient('token-voting.plugin.dao.eth');

  return useMutation({
    mutationFn: (params: IDelegateTokensParams) =>
      delegateTokens(params, client),
    ...options,
  });
};
