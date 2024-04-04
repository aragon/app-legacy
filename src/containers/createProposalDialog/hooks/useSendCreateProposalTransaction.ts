import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useSendTransaction} from 'hooks/useSendTransaction';
import {useWallet} from 'hooks/useWallet';
import {useFormContext} from 'react-hook-form';
import {ITransaction} from 'services/transactions/domain/transaction';
import {CreateProposalFormData, SupportedVotingSettings} from 'utils/types';
import {
  ICreateProposalParams,
  createProposalUtils,
} from '../utils/createProposalUtils';
import {useProviders} from 'context/providers';
import {ProposalStatus} from '@aragon/sdk-client-common';
import {
  isGaslessVotingSettings,
  isMultisigVotingSettings,
  isTokenVotingSettings,
} from 'services/aragon-sdk/queries/use-voting-settings';
import {
  CreateMajorityVotingProposalParams,
  CreateMultisigProposalParams,
  MajorityVotingProposalSettings,
  MultisigProposal,
  TokenVotingProposal,
  VoteValues,
} from '@aragon/sdk-client';
import {CHAIN_METADATA} from 'utils/constants';
import {useNetwork} from 'context/network';
import {differenceInSeconds} from 'date-fns';
import {GaslessVotingProposal} from '@vocdoni/gasless-voting';
import {proposalStorage} from 'utils/localStorage/proposalStorage';
import {useVotingPower} from 'services/aragon-sdk/queries/use-voting-power';
import {useDaoToken} from 'hooks/useDaoToken';
import {useTokenSupply} from 'hooks/useTokenSupply';
import {TransactionReceipt} from 'viem';
import {PluginTypes} from 'hooks/usePluginClient';
import {AragonSdkQueryItem} from 'services/aragon-sdk/query-keys';
import {aragonSubgraphQueryKeys} from 'services/aragon-subgraph/query-keys';
import {useQueryClient} from '@tanstack/react-query';

export interface IUseSendCreateProposalTransactionParams {
  /**
   * Process name for logging.
   */
  process: string;
  /**
   * CreateProposal transaction to be sent.
   */
  transaction?: ITransaction;
  /**
   * Voting settings of the current DAO.
   */
  votingSettings?: SupportedVotingSettings | null;
  /**
   * Parameters for the proposal creation.
   */
  createProposalParams?: ICreateProposalParams;
}

export const useSendCreateProposalTransaction = (
  params: IUseSendCreateProposalTransactionParams
) => {
  const {process, transaction, votingSettings, createProposalParams} = params;

  const {getValues} = useFormContext<CreateProposalFormData>();
  const formValues = getValues();

  const {data: daoDetails} = useDaoDetailsQuery();
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;
  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;

  const {data: daoToken} = useDaoToken(pluginAddress);
  const {data: tokenSupply} = useTokenSupply(daoToken?.address || '');

  const queryClient = useQueryClient();
  const {address} = useWallet();
  const {api: apiProvider} = useProviders();
  const {network} = useNetwork();
  const {data: votingPower} = useVotingPower(
    {tokenAddress: daoToken?.address as string, address: address as string},
    {enabled: !!daoToken?.address && !!address}
  );

  const handleCreateProposalSuccess = async (txReceipt: TransactionReceipt) => {
    if (!address || !daoDetails || !votingSettings || !createProposalParams)
      return;

    const {startDate, endDate, actions} = createProposalParams;

    const proposalId = createProposalUtils.getProposalIdFromReceipt(
      txReceipt,
      pluginType,
      pluginAddress
    );

    const creationBlockNumber = await apiProvider.getBlockNumber();
    const metadata = createProposalUtils.formValuesToProposalMetadata(
      formValues as CreateProposalFormData
    );

    const baseParams = {
      id: proposalId,
      dao: {address: daoDetails.address, name: daoDetails.metadata.name},
      creationDate: new Date(),
      creatorAddress: address,
      creationBlockNumber,
      startDate,
      endDate,
      metadata,
      actions,
      status: startDate ? ProposalStatus.PENDING : ProposalStatus.ACTIVE,
    };

    if (isMultisigVotingSettings(votingSettings)) {
      const {approve: creatorApproval} =
        createProposalParams as CreateMultisigProposalParams;

      const proposal = {
        ...baseParams,
        approvals: creatorApproval ? [address] : [],
        settings: votingSettings,
      } as MultisigProposal;
      proposalStorage.addProposal(CHAIN_METADATA[network].id, proposal);
    } else if (isTokenVotingSettings(votingSettings)) {
      const {creatorVote} =
        createProposalParams as CreateMajorityVotingProposalParams;

      const creatorVotingPower = votingPower?.toBigInt() ?? BigInt(0);

      const result = {
        yes: creatorVote === VoteValues.YES ? creatorVotingPower : BigInt(0),
        no: creatorVote === VoteValues.NO ? creatorVotingPower : BigInt(0),
        abstain:
          creatorVote === VoteValues.ABSTAIN ? creatorVotingPower : BigInt(0),
      };

      let usedVotingWeight = BigInt(0);
      const votes = [];
      if (creatorVote) {
        usedVotingWeight = creatorVotingPower;
        votes.push({
          address,
          vote: creatorVote,
          voteReplaced: false,
          weight: creatorVotingPower,
        });
      }

      const settings: MajorityVotingProposalSettings = {
        supportThreshold: votingSettings.supportThreshold,
        minParticipation: votingSettings.minParticipation,
        duration: differenceInSeconds(
          baseParams.endDate ?? new Date(),
          baseParams.startDate ?? new Date()
        ),
      };

      const proposal = {
        ...baseParams,
        result,
        settings,
        usedVotingWeight,
        totalVotingWeight: tokenSupply?.raw ?? BigInt(0),
        token: daoToken ?? null,
        votes,
      } as TokenVotingProposal;
      proposalStorage.addProposal(CHAIN_METADATA[network].id, proposal);
    } else if (isGaslessVotingSettings(votingSettings)) {
      const proposal = {
        ...baseParams,
        executed: false,
        approvers: new Array<string>(),
        vochainProposalId: 'TODO',
        settings: votingSettings,
        participation: {
          currentParticipation: 0,
          currentPercentage: 0,
          missingParticipation: 100,
        },
        token: daoToken,
      } as GaslessVotingProposal;
      proposalStorage.addProposal(CHAIN_METADATA[network].id, proposal);
    }

    queryClient.invalidateQueries([AragonSdkQueryItem.PROPOSALS]);
    queryClient.invalidateQueries(
      aragonSubgraphQueryKeys.totalProposalCount({pluginAddress, pluginType})
    );
  };

  const sendTransactionResults = useSendTransaction({
    logContext: {stack: [process], data: formValues},
    transaction,
    onSuccess: handleCreateProposalSuccess,
  });

  return sendTransactionResults;
};
