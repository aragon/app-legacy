import {
  ApproveMultisigProposalParams,
  VoteProposalParams,
} from '@aragon/sdk-client';
import {useProposalTransactionContext} from 'context/proposalTransaction';
import {PluginTypes} from 'hooks/usePluginClient';

class VoteOrApprovalUtils {
  defaultTokenDecimals = 18;

  buildVoteOrApprovalParams = (PluginType: PluginTypes) => {
    let param: VoteProposalParams | ApproveMultisigProposalParams | undefined =
      undefined;
    const {approvalParams, voteParams} = useProposalTransactionContext();

    switch (PluginType) {
      case 'token-voting.plugin.dao.eth': {
        param = voteParams;
        break;
      }
      case 'multisig.plugin.dao.eth': {
        param = approvalParams;
        break;
      }
      // case 'vocdoni-gasless-voting-poc-vanilla-erc20.plugin.dao.eth': {
      //   const param =
      // }
      default:
        throw new Error(`Unknown plugin type`);
    }

    return param;
  };
}

export const voteOrApprovalUtils = new VoteOrApprovalUtils();
