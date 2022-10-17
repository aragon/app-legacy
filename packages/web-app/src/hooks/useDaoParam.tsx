import {useQuery} from '@apollo/client';
import {useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import {client} from 'context/apolloClient';
import {useNetwork} from 'context/network';
import {DAO_BY_ADDRESS} from 'queries/dao';
import {NotFound} from 'utils/paths';

/**
 * This hook queries the current URL for a the DAO address and validates that a
 * DAO with this address exists. This is done querying subgraph for a dao with
 * the id parsed from the URL. If the dao exists, the id is simply returned. If
 * it does not exist, the user is redirected to the 404 page.
 *
 * @returns A apollo query result containing the DAO id.
 */
export function useDaoParam() {
  const {dao} = useParams();
  const {network} = useNetwork();

  // NOTE At this point, daoParam will always be defined.
  const {
    data,
    error,
    loading: isLoading,
  } = useQuery(DAO_BY_ADDRESS, {
    variables: {id: dao},
    client: client[network]!,
    fetchPolicy: 'no-cache',
  });
  const navigate = useNavigate();

  useEffect(() => {
    // undefined mainnet clients cause problem here. This bypasses the dao param
    // validation on mainnets and immediately redirects to notfound (which makes
    // sense since there can not yet be daos on mainnets). Remove this if
    // statement once those clients are implemented.
    if (!client[network])
      navigate(NotFound, {replace: true, state: {incorrectDao: dao}});

    if (isLoading) {
      return;
    } else if (error || !data?.dao?.id) {
      navigate(NotFound, {replace: true, state: {incorrectDao: dao}});
    }
  }, [isLoading, dao, network]); // eslint-disable-line

  return {data: data?.dao?.id, error, isLoading};
}
