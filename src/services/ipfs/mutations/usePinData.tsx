import {MutationOptions} from '@tanstack/query-core';
import {IPinDataProps, IPinDataResult} from '../ipfsService.api';
import {useMutation} from '@tanstack/react-query';
import {ipfsService} from '../ipfsService';

export const usePinData = (
  options?: MutationOptions<IPinDataResult, unknown, IPinDataProps>
) => {
  return useMutation({
    mutationFn: params => ipfsService.pinData(params),
    ...options,
  });
};
