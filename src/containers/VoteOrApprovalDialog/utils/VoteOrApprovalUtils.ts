import {PluginInstallItem} from '@aragon/sdk-client-common';
import {PluginTypes} from 'hooks/usePluginClient';

class VoteOrApprovalUtils {
  defaultTokenDecimals = 18;

  buildVoteOrApprovalParams = (PluginType: PluginTypes) => {
    const plugins: PluginInstallItem[] = [];

    switch(PluginType){
      case 'token-voting.plugin.dao.eth': {
        const param = 
      }
      case 'multisig.plugin.dao.eth': {
        const param = 
      }
      case 'vocdoni-gasless-voting-poc-vanilla-erc20.plugin.dao.eth': {
        const param = 
      }
    }
    
  };
}

export const voteOrApprovalUtils = new VoteOrApprovalUtils();
