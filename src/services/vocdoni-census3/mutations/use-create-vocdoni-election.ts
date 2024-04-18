import {MutationOptions} from '@tanstack/query-core';
import {useMutation} from '@tanstack/react-query';
import {ICreateVocdoniElectionParams} from '../census3-service.api';
import {createVocdoniElection} from '../census3-service';
import {IVocdoniElectionResult} from '../domain/vocdoniElectionResult';

export const useCreateVocdoniElection = (
  options?: MutationOptions<
    IVocdoniElectionResult,
    unknown,
    ICreateVocdoniElectionParams
  >
) => {
  return useMutation({
    mutationFn: params => createVocdoniElection(params),
    ...options,
  });
};
