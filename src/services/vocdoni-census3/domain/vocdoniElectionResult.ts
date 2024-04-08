import {TokenCensus} from '@vocdoni/sdk';

export interface IVocdoniElectionResult {
  electionId: string;
  tokenCensus: TokenCensus;
}
