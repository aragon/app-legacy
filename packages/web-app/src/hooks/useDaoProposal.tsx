/**
 * NOTE: Because most of these hooks merely returns the fetched
 * data, we can later extract the similar logic into a hook of it's own
 * so we don't have to rewrite the fetch and return pattern every time
 */

import {
  AddressListProposal,
  ClientAddressList,
  Erc20Proposal,
} from '@aragon/sdk-client';
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
 * @param pluginType plugin type
 * @returns a detailed proposal
 */

export const useDaoProposal = (
  proposalId: string,
  pluginAddress: string,
  pluginType: PluginTypes
): HookData<DetailedProposal | undefined> => {
  const [data, setData] = useState<DetailedProposal>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);
  const [encodedActions, setEncodedActions] = useState<DaoAction[]>();
  const {client: globalClient} = useClient();
  const pluginClient = usePluginClient(
    pluginAddress,
    pluginType as PluginTypes
  );
  const daoAddress = '0x1234567890123456789012345678901234567890';

  useEffect(() => {
    // TODO: this method is for dummy usage only, Will remove later
    const members: string[] = [
      '0x1357924680135792468013579246801357924680',
      '0x2468013579246801357924680135792468013579',
      '0x0987654321098765432109876543210987654321',
    ];

    const getEncodedAction = async () => {
      if (!globalClient || !pluginClient) return;
      const encodedWithdrawAction = globalClient.encoding.withdrawAction(
        daoAddress,
        {
          recipientAddress: '0x1234567890123456789012345678901234567890',
          amount: BigInt(10),
          tokenAddress: constants.AddressZero,
          reference: 'test',
        }
      );
      const encodedAddMembersAction = (
        pluginClient as ClientAddressList
      ).encoding.addMembersAction(pluginAddress, members);

      const encodedRemoveMembersAction = (
        pluginClient as ClientAddressList
      ).encoding.removeMembersAction(daoAddress, members);
      console.log(
        'details',
        await Promise.all([
          encodedWithdrawAction,
          encodedAddMembersAction,
          encodedRemoveMembersAction,
        ])
      );
    };

    getEncodedAction();
  }, [globalClient, pluginAddress, pluginClient]);

  useEffect(() => {
    async function getDaoProposal() {
      try {
        setIsLoading(true);
        const proposal = await pluginClient?.methods.getProposal(proposalId);
        if (proposal && encodedActions) proposal.actions = encodedActions;
        if (proposal) setData(proposal);
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    getDaoProposal();
  }, [encodedActions, pluginClient?.methods, proposalId]);

  return {data, error, isLoading};
};
