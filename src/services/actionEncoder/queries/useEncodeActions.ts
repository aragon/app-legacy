import {UseMutationOptions, useMutation} from '@tanstack/react-query';
import {IEncodeActionParams} from '../actionEncoderService.api';
import {actionEncoderService} from '../actionEncoderService';
import {DaoAction} from '@aragon/sdk-client-common';

export const useEncodeActions = (
  options?: UseMutationOptions<DaoAction[], unknown, IEncodeActionParams>
) => {
  return useMutation({
    mutationFn: (params: IEncodeActionParams) =>
      actionEncoderService.encodeActions(params),
    ...options,
  });
};
