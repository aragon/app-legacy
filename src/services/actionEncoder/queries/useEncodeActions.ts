import {UseQueryOptions, useQuery} from '@tanstack/react-query';
import {actionEncoderQueryKeys} from '../queryKeys';
import {IEncodeActionParams} from '../actionEncoderService.api';
import {actionEncoderService} from '../actionEncoderService';
import {DaoAction} from '@aragon/sdk-client-common';

export const useEncodeActions = (
  params: IEncodeActionParams,
  options?: Omit<UseQueryOptions<DaoAction[] | null>, 'queryKey'>
) => {
  return useQuery({
    queryKey: actionEncoderQueryKeys.encodeActions(params),
    queryFn: () => actionEncoderService.encodeActions(params),
    ...options,
  });
};
