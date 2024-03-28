import {MutationOptions} from '@tanstack/query-core';
import {IAddDataProps} from '../ipfsService.api';
import {useMutation} from '@tanstack/react-query';
import {ipfsService} from '../ipfsService';

export const useAddData = (
  options?: MutationOptions<string, unknown, IAddDataProps>
) => {
  return useMutation({
    mutationFn: params => ipfsService.addData(params),
    ...options,
  });
};
