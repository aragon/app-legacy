import {useMutation, UseMutationOptions} from '@tanstack/react-query';
import {aragonSdkService} from '../aragon-sdk-service';
import {IDelegateTokensParams} from '../aragon-sdk-service.api';
import {usePluginClient} from 'hooks/usePluginClient';
import {DelegateTokensStepValue} from '@aragon/sdk-client';

export const useDelegateTokens = (
  options?: UseMutationOptions<
    AsyncGenerator<DelegateTokensStepValue>,
    unknown,
    IDelegateTokensParams
  >
) => {
  const client = usePluginClient('token-voting.plugin.dao.eth');

  return useMutation(
    (params: IDelegateTokensParams) =>
      aragonSdkService.delegateTokens(params, client),
    options
  );
};
