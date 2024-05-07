import {useQuery} from '@tanstack/react-query';
import {ipfsService} from '../ipfsService';

export const useGetData = (cid: string) => {
  return useQuery({
    queryKey: ['fetchIPFS', cid],
    queryFn: () => ipfsService.getData(cid),
    enabled: !!cid,
  });
};
