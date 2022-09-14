/**
 * NOTE: Because most of these hooks merely returns the fetched
 * data, we can later extract the similar logic into a hook of it's own
 * so we don't have to rewrite the fetch and return pattern every time
 */

import {AddressListProposal, Erc20Proposal} from '@aragon/sdk-client';
import {useEffect, useState} from 'react';
import {useApolloClient} from '@apollo/client';

import {HookData} from 'utils/types';
import {useClient} from './useClient';
import {decodeWithdrawToAction} from './useDecodeWithdrawToAction';
import {PluginTypes, usePluginClient} from './usePluginClient';
import {useNetwork} from 'context/network';
import {DaoAction} from '@aragon/sdk-client/dist/internal/interfaces/common';

export type DetailedProposal = Erc20Proposal | AddressListProposal;

/**
 * Retrieve a single detailed proposal
 * @param proposalId id of proposal to retrieve
 * @param pluginAddress plugin from which proposals will be retrieved
 * @param type plugin type
 * @returns a detailed proposal
 */

export const useDaoProposal = (
  proposalId: string,
  pluginAddress: string,
  type: PluginTypes
): HookData<DetailedProposal | undefined> => {
  const [data, setData] = useState<DetailedProposal>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);
  const [encodedData, setEncodedData] = useState<DaoAction | undefined>();
  const {client: globalClient} = useClient();
  const {network} = useNetwork();

  const apolloClient = useApolloClient();
  const daoAddress = '0x1234567890123456789012345678901234567890';

  useEffect(() => {
    const getClient = async () => {
      const encodedAction = await globalClient?.encoding.withdrawAction(
        daoAddress,
        {
          recipientAddress: '0x1234567890123456789012345678901234567890',
          amount: BigInt(10),
          tokenAddress: '0xa1cba00d6e99f52b8cb5f867a6f2db0f3ad62276',
          reference: 'test',
        }
      );
      setEncodedData(encodedAction);
    };
    getClient();
  }, [globalClient?.encoding]);

  const client = usePluginClient(type, pluginAddress);

  useEffect(() => {
    async function getDaoProposal() {
      try {
        setIsLoading(true);
        console.log('action', encodedData?.data);
        const proposal = await client?.methods.getProposal(proposalId);
        const action = await decodeWithdrawToAction(
          encodedData?.data,
          globalClient,
          apolloClient,
          network
        );
        console.log('see', action);
        if (proposal) setData(proposal);
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    getDaoProposal();
  }, [
    encodedData,
    apolloClient,
    client?.methods,
    globalClient,
    network,
    proposalId,
  ]);

  return {data, error, isLoading};
};
