import {
  AccountData,
  Election,
  ErrFaucetAlreadyFunded,
  ErrNotFoundToken,
  Token,
  TokenCensus,
  UnpublishedElection,
  VocdoniSDKClient,
} from '@vocdoni/sdk';
import {
  ICreateAccountParams,
  ICreateVocdoniElectionParams,
  IFetchVotingPowerByCensusId,
  IFetchVotingPowerByTokenAddress,
  IGetCensus3TokenParams,
} from './census3-service.api';
import {VoteValues} from '@aragon/sdk-client';
import {IVocdoniElectionResult} from './domain/vocdoniElectionResult';

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

export async function createAccount({
  vocdoniClient,
}: ICreateAccountParams): Promise<AccountData> {
  const account = await vocdoniClient.createAccount();
  return account;
}

export async function createVocdoniElection(
  params: ICreateVocdoniElectionParams
): Promise<IVocdoniElectionResult> {
  const {census3, metadata, data, vocdoniClient} = params;
  const censusToken = await getCensus3Token(params);

  // Create the vocdoni census
  const census3census = await census3.createCensus(censusToken.defaultStrategy);

  const tokenCensus = new TokenCensus(
    census3census.merkleRoot,
    census3census.uri,
    census3census.anonymous,
    censusToken,
    census3census.size,
    BigInt(census3census.weight)
  );

  const electionData = {
    title: metadata.title,
    description: metadata.description,
    question: metadata.summary,
    startDate: data.gaslessStartDate,
    endDate: data.gaslessEndDate,
    meta: data,
    census: tokenCensus,
  };

  const election: UnpublishedElection = Election.from({
    title: electionData.title,
    description: electionData.description,
    endDate: electionData.endDate,
    startDate: electionData.startDate,
    census: electionData.census,
    maxCensusSize: electionData.census.size ?? undefined,
    electionType: {interruptible: false},
  });

  election.addQuestion(
    electionData.question,
    '',
    // Map choices from Aragon enum.
    // This is important to respect the order and the values
    Object.keys(VoteValues)
      .filter(key => isNaN(Number(key)))
      .map((key, i) => ({
        title: key,
        value: i,
      }))
  );

  const cost = await vocdoniClient.calculateElectionCost(election);
  await collectFaucet(cost, vocdoniClient);

  const electionId = await vocdoniClient.createElection(election);

  return {electionId, tokenCensus};
}

async function collectFaucet(cost: number, client: VocdoniSDKClient) {
  let balance = (await client.fetchAccount()).balance;
  while (cost > balance) {
    try {
      balance = (await client.collectFaucetTokens()).balance;
    } catch (e) {
      // Wallet already funded
      if (e instanceof ErrFaucetAlreadyFunded) {
        const dateStr = `(until ${e.untilDate.toLocaleDateString()})`;
        throw Error(
          `This wallet has reached the maximum allocation of Vocdoni tokens for this period ${dateStr}. ` +
            'For additional tokens, please visit https://onvote.app/faucet and retry after acquiring more.'
        );
      }
      throw e;
    }
  }
}

async function getCensus3Token({
  census3,
  tokenAddress,
  chainId,
  pluginAddress,
  createToken,
}: IGetCensus3TokenParams): Promise<Token> {
  let attempts = 0;
  const maxAttempts = 6;

  while (attempts < maxAttempts) {
    try {
      const censusToken = await census3.getToken(tokenAddress, chainId);

      if (censusToken.status.synced) {
        return censusToken; // early exit if the object has sync set to true
      }
    } catch (e) {
      if (e instanceof ErrNotFoundToken) {
        await createToken(pluginAddress);
      }
    }
    attempts++;
    if (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  throw Error('Census token is not already calculated, try again later');
}
