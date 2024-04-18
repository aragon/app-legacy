import {MutationOptions} from '@tanstack/query-core';
import {useMutation} from '@tanstack/react-query';
import {ICreateAccountParams} from '../census3-service.api';
import {createAccount} from '../census3-service';
import {AccountData} from '@vocdoni/sdk';

export const useCreateAccount = (
  options?: MutationOptions<AccountData, unknown, ICreateAccountParams>
) => {
  return useMutation({
    mutationFn: params => createAccount(params),
    ...options,
  });
};
