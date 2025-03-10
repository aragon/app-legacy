import {useQuery} from '@tanstack/react-query';
import {IDao} from 'services/aragon-backend/domain/dao';

const FEATURED_DAOS_URL =
  'https://raw.githubusercontent.com/aragon/app-featured-daos/main/featured-daos.json';

const fetchFeaturedDaos = async (): Promise<IDao[]> => {
  const response = await fetch(FEATURED_DAOS_URL);

  if (!response.ok) {
    throw new Error('Failed to fetch featured DAOs');
  }

  const data: IDao[] = await response.json();
  return data;
};

export const useFeaturedDaos = () => {
  return useQuery({queryKey: ['featuredDaos'], queryFn: fetchFeaturedDaos});
};
