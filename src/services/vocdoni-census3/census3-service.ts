import {VocdoniCensus3Client, VocdoniSDKClient} from '@vocdoni/sdk';

/**
 * Returns the voting power for the specified address at specified vocdoni census id.
 * This is the way to get the voting power for vocdoni processes.
 */
export async function getCensus3VotingPowerByCensusId(
  vocdoniClient: VocdoniSDKClient,
  holderAddress: string,
  censusId: string
) {
  return (await vocdoniClient.fetchProof(censusId, holderAddress)).weight;
}

/**
 * Returns the voting power for the specified address using vocdoni census3 service.
 * It returns the last known holder balance for a specific token.
 */
export async function getCensus3VotingPowerByTokenAddress(
  census3Client: VocdoniCensus3Client,
  tokenId: string,
  chainId: number,
  holderId: string
) {
  return await census3Client.tokenHolderBalance(tokenId, chainId, holderId);
}
