/**
 * NOTE: Because most of these hooks merely returns the fetched
 * data, we can later extract the similar logic into a hook of it's own
 * so we don't have to rewrite the fetch and return pattern every time
 */

import {AddressListProposal, Erc20Proposal} from '@aragon/sdk-client';
import {useEffect, useState} from 'react';

import {HookData} from 'utils/types';
import {useClient} from './useClient';
import {PluginTypes, usePluginClient} from './usePluginClient';
import {DaoAction} from '@aragon/sdk-client/dist/internal/interfaces/common';
import {constants} from 'ethers';

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
  const daoAddress = '0x1234567890123456789012345678901234567890';

  useEffect(() => {
    // TODO: this method is for dummy usage only, Will remove later
    const getEncodedAction = async () => {
      const encodedAction = await globalClient?.encoding.withdrawAction(
        daoAddress,
        {
          recipientAddress: '0x1234567890123456789012345678901234567890',
          amount: BigInt(10),
          tokenAddress: constants.AddressZero,
          reference: 'test',
        }
      );
      setEncodedData(encodedAction);
    };
    getEncodedAction();
  }, [globalClient?.encoding]);

  const client = usePluginClient(type, pluginAddress);

  useEffect(() => {
    async function getDaoProposal() {
      try {
        setIsLoading(true);
        const proposal = await client?.methods.getProposal(proposalId);
        if (proposal && encodedData) proposal.actions[0] = encodedData;
        if (proposal) setData(proposal);
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    getDaoProposal();
  }, [client?.methods, encodedData, proposalId]);

  return {data, error, isLoading};
};
