import {
  DaoMetadata,
  MultisigClient,
  TokenVotingClient,
  TokenVotingPluginInstall,
  VotingMode,
} from '@aragon/sdk-client';
import {
  DAORegistry__factory,
  PluginSetupProcessor__factory,
} from '@aragon/osx-ethers';
import {parseUnits} from 'ethers/lib/utils';
import {
  PluginInstallItem,
  SupportedNetwork as SdkSupportedNetworks,
} from '@aragon/sdk-client-common';
import {
  GaslessPluginVotingSettings,
  GaslessVotingClient,
  GaslessVotingPluginInstall,
} from '@vocdoni/gasless-voting';
import {getSupportedNetworkByChainId} from 'utils/constants';
import {getSecondsFromDHM} from 'utils/date';
import {translateToNetworkishName} from 'utils/library';
import {CreateDaoFormData} from 'utils/types';
import {TransactionReceipt} from 'viem';
import {id} from '@ethersproject/hash';

class VoteOrApprovalUtils {
  defaultTokenDecimals = 18;

  handlePrepareApproval = (params: ApproveMultisigProposalParams) => {
    setApprovalParams(params);
    setShowVoteModal(true);
    setVoteOrApprovalProcessState(TransactionState.WAITING);
  };

  handlePrepareVote = (params: SubmitVoteParams) => {
    setVotingPower(params.votingPower);
    setReplacingVote(!!params.replacement);
    setVoteTokenAddress(params.voteTokenAddress);

    setVoteParams({proposalId, vote: params.vote});
    setShowVoteModal(true);
    setVoteOrApprovalProcessState(TransactionState.WAITING);
  };
}

export const voteOrApprovalUtils = new VoteOrApprovalUtils();
