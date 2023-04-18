import {isAddress} from '@ethersproject/address';
import {useEffect} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';

import {toDisplayEns} from 'utils/library';
import {NotFound} from 'utils/paths';
import {useDaoDetails} from './useDaoDetails';

/**
 * This hook queries the current URL for a the DAO address and validates that a
 * DAO with this address exists. This is done querying subgraph for a dao with
 * the id parsed from the URL. If the dao exists, the id is simply returned. If
 * it does not exist, the user is redirected to the 404 page.
 *
 * @returns A DAO id from SDK.
 */
export function useDaoParam() {
  const {dao} = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // NOTE At this point, daoParam will always be defined.
  const {data, error, isLoading, waitingForSubgraph} = useDaoDetails(
    dao! as string
  );

  useEffect(() => {
    if (isLoading) {
      return;
    } else if (error || data === null) {
      navigate(NotFound, {replace: true, state: {incorrectDao: dao}});
    } else if (dao && isAddress(dao) && toDisplayEns(data?.ensDomain)) {
      const segments = location.pathname.split('/');
      const daoIndex = segments.findIndex(segment => segment === dao);

      if (daoIndex !== -1 && data?.ensDomain) {
        segments[daoIndex] = data.ensDomain;
        navigate(segments.join('/'));
      }
    }
  }, [dao, data, error, isLoading, location.pathname, navigate]);

  return {
    daoDetails: data,
    data: (dao as string).toLowerCase(),
    error,
    isLoading,
    waitingForSubgraph,
  };
}
