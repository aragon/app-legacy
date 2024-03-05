import {
  IFetchVotingPowerByCensusId,
  IFetchVotingPowerByTokenAddress,
} from './census3-service.api';

/**
 * Returns the voting power for the specified address at specified vocdoni census id.
 * This is the way to get the voting power for vocdoni processes.
 */
export async function fetchVotingPowerByCensusId({
  vocdoniClient,
  holderAddress,
  censusId,
}: IFetchVotingPowerByCensusId) {
  return (await vocdoniClient.fetchProof(censusId, holderAddress)).weight;
}

/**
 * Returns the voting power for the specified address using vocdoni census3 service.
 * It returns the last known holder balance for a specific token.
 */
export async function fetchVotingPowerByTokenAddress({
  census3Client,
  tokenId,
  chainId,
  holderId,
}: IFetchVotingPowerByTokenAddress) {
  return await census3Client.tokenHolderBalance(tokenId, chainId, holderId);
}
