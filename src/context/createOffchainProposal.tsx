import {
  CreateMajorityVotingProposalParams,
  Erc20TokenDetails,
  Erc20WrapperTokenDetails,
} from '@aragon/sdk-client';
import {ProposalMetadata} from '@aragon/sdk-client-common';
import React, {useCallback, useMemo, useState} from 'react';

import {
  AccountData,
  Census,
  Election,
  ErrAccountNotFound,
  ErrTokenAlreadyExists,
  ICensus3Token,
  IElectionParameters,
  UnpublishedElection,
} from '@vocdoni/sdk';
import {VoteValues} from '@aragon/sdk-client';
import {
  OffchainPluginLocalStorageKeys,
  OffchainPluginLocalStorageTypes,
} from '../hooks/useVocdoniSdk';
import {useClient} from '@vocdoni/react-providers';
import {
  StepsMap,
  StepStatus,
  useFunctionStepper,
} from '../hooks/useFunctionStepper';
import {
  IconRadioCancel,
  IconRadioDefault,
  IconSuccess,
  Spinner,
} from '@aragon/ods';

// todo(kon): move this block somewhere else
export enum OffchainProposalStepId {
  REGISTER_VOCDONI_ACCOUNT = 'REGISTER_VOCDONI_ACCOUNT',
  CREATE_VOCDONI_ELECTION = 'CREATE_VOCDONI_ELECTION',
  CREATE_ONCHAIN_PROPOSAL = 'CREATE_ONCHAIN_PROPOSAL',
  PROPOSAL_IS_READY = 'PROPOSAL_IS_READY',
}

export type OffchainProposalSteps = StepsMap<OffchainProposalStepId>;

type ICreateOffchainProposal = {
  daoToken: Erc20TokenDetails | Erc20WrapperTokenDetails | undefined;
};

export type UseCreateElectionProps = Omit<
  IElectionParameters,
  | 'header'
  | 'streamUri'
  | 'voteType'
  | 'electionType'
  | 'questions'
  | 'maxCensusSize'
  | 'addSDKVersion'
> & {
  question: string;
};

interface IProposalToElectionProps {
  metadata: ProposalMetadata;
  data: CreateMajorityVotingProposalParams;
  census: Census;
}

const proposalToElection = ({
  metadata,
  data,
  census,
}: IProposalToElectionProps): UseCreateElectionProps => {
  return {
    title: metadata.title,
    description: metadata.description,
    question: metadata.summary,
    startDate: data?.startDate ?? new Date(),
    endDate: data?.endDate ?? new Date(),
    meta: 'todo',
    census: census,
  };
};

// todo(kon): end to move this block somewhere else

const useCreateOffchainProposal = ({daoToken}: ICreateOffchainProposal) => {
  const [electionId, setElectionId] = useState('');
  // todo(kon): only cache the proposal using local storage?
  const cacheProposal = useCallback(
    (proposalId: string, electionId: string) => {
      console.log('DEBUG', 'Caching proposal', proposalId, electionId);
      if (!electionId) return;

      const proposal = {
        [proposalId]: {
          electionId: electionId,
        },
      } as OffchainPluginLocalStorageTypes[OffchainPluginLocalStorageKeys.PROPOSAL_TO_ELECTION];

      const proposalsIds = localStorage.getItem(
        OffchainPluginLocalStorageKeys.PROPOSAL_TO_ELECTION
      );

      if (proposalsIds === null) {
        localStorage.setItem(
          OffchainPluginLocalStorageKeys.PROPOSAL_TO_ELECTION,
          JSON.stringify({
            ...proposal,
          } as OffchainPluginLocalStorageTypes[OffchainPluginLocalStorageKeys.PROPOSAL_TO_ELECTION])
        );
      } else {
        const parsed = JSON.parse(
          proposalsIds
        ) as OffchainPluginLocalStorageTypes[OffchainPluginLocalStorageKeys.PROPOSAL_TO_ELECTION];
        localStorage.setItem(
          OffchainPluginLocalStorageKeys.PROPOSAL_TO_ELECTION,
          JSON.stringify({
            ...parsed,
            ...proposal,
          } as OffchainPluginLocalStorageTypes[OffchainPluginLocalStorageKeys.PROPOSAL_TO_ELECTION])
        );
      }
    },
    []
  );

  const {steps, updateStepStatus, doStep, globalState} = useFunctionStepper({
    initialSteps: {
      REGISTER_VOCDONI_ACCOUNT: {
        status: StepStatus.WAITING,
      },
      CREATE_VOCDONI_ELECTION: {
        status: StepStatus.WAITING,
      },
      CREATE_ONCHAIN_PROPOSAL: {
        status: StepStatus.WAITING,
      },
      PROPOSAL_IS_READY: {
        status: StepStatus.WAITING,
      },
    } as OffchainProposalSteps,
  });

  const {client: vocdoniClient, census3} = useClient();

  // todo(kon): move this somewhere?
  const collectFaucet = useCallback(
    async (cost: number, account: AccountData) => {
      let balance = account.balance;
      while (cost > balance) {
        balance = (await vocdoniClient.collectFaucetTokens()).balance;
      }
    },
    [vocdoniClient]
  );

  const createVocdoniElection = useCallback(
    async (electionData: UseCreateElectionProps) => {
      const election: UnpublishedElection = Election.from({
        title: electionData.title,
        description: electionData.description,
        endDate: electionData.endDate,
        startDate: electionData.startDate,
        census: electionData.census,
        maxCensusSize: electionData.census.size ?? undefined,
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
      // todo(kon): handle how collect faucet have to work
      const cost = await vocdoniClient.estimateElectionCost(election);
      const accountInfo = await vocdoniClient.fetchAccountInfo();
      console.log('DEBUG', 'Estimated cost', cost, accountInfo);

      await collectFaucet(cost, accountInfo);

      console.log('DEBUG', 'Faucet collected, creating election:', election);
      return await vocdoniClient.createElection(election);

      // try {
      // } catch (e) {
      //   // todo(kon): replace error handling
      //   if ((e as string).includes('not enough balance to transfer')) {
      //     console.log('DEBUG', 'error, collecting faucet', election);
      //     // todo(kon): do an estimation and collect tokens as many as needed
      //     await vocdoniClient.collectFaucetTokens();
      //     console.log('DEBUG', 'faucet collected', election);
      //     return await vocdoniClient.createElection(election);
      //     console.log('DEBUG', 'election created after faucet collected');
      //   } else throw e;
      // }
    },
    [vocdoniClient]
  );

  const createAccount = useCallback(async () => {
    // Check if the account is already created, if not, create it
    let account: AccountData | null = null;
    try {
      console.log('DEBUG', 'get  account info');
      account = await vocdoniClient.fetchAccountInfo();
    } catch (e) {
      // todo(kon): replace error handling when the api return code error is fixed. Now is a generic 500
      if (e instanceof ErrAccountNotFound) {
        console.log('DEBUG', 'Account not found, creating it');
        account = await vocdoniClient.createAccount();
      } else throw e;
    }

    if (!account) {
      throw Error('Error creating a Vocdoni account');
    }

    return account;
  }, [vocdoniClient]);

  const createCensus = useCallback(async () => {
    // todo(kon): this part is gonna be done during the dao creation, so not need to be done here. Neither error handling
    const chain = 80003;
    if (!(await census3.getSupportedChains()).includes(chain))
      throw Error('ChainId is not supported');
    // Check if the census is already sync
    try {
      await census3.createToken(daoToken!.address, 'erc20', chain);
    } catch (e) {
      if (e instanceof ErrTokenAlreadyExists) {
        console.log('DEBUG', 'Token already created');
      }
      // todo(kon): handle chain is not supported
      else if (
        e instanceof Error &&
        e.message.includes('chain ID provided not supported')
      ) {
        throw Error('ChainId is not supported');
      } else throw e;
    }

    async function getCensus3Token(): Promise<ICensus3Token> {
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        const censusToken = await census3.getToken(daoToken!.address);
        if (censusToken.status.synced) {
          return censusToken; // early exit if the object has sync set to true
        }
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 6000));
        }
      }
      throw Error('Census token is not already calculated, try again later');
    }

    const censusToken = await getCensus3Token();
    console.log('DEBUG', 'Census', censusToken);

    // Create the vocdoni census
    console.log('DEBUG', 'Creating vocdoni census');
    return await census3.createTokenCensus(censusToken.id);
  }, [census3, daoToken]);

  const createProposal = useCallback(
    async (
      metadata: ProposalMetadata,
      data: CreateMajorityVotingProposalParams,
      // todo(kon): change this when min sdk is ready
      handleOnchainProposal: (electionId?: string) => Promise<Error | undefined>
    ) => {
      console.log(
        'DEBUG',
        'Start creating a proposal. Global state:',
        globalState,
        steps
      );

      // todo(kon): handle the click when global state is success to open the proposal again
      if (globalState === StepStatus.SUCCESS) {
        return await handleOnchainProposal();
      }

      if (!daoToken) {
        return new Error('ERC20 SDK client is not initialized correctly');
      }

      // 1. Create an account if not exists
      const account = await doStep(
        OffchainProposalStepId.REGISTER_VOCDONI_ACCOUNT,
        createAccount
      );
      console.log('DEBUG', 'Account created start creating offchain proposal');

      // 2. Create vocdoni election
      const electionId = await doStep(
        OffchainProposalStepId.CREATE_VOCDONI_ELECTION,
        async () => {
          // 2.1 Register offchain proposal
          // This involves various steps such the census creation and election creation
          console.log('DEBUG', 'Creating vocdoni census');
          const census = await createCensus();
          // 2.2. Create vocdoni election
          console.log('DEBUG', 'Creating vocdoni election');
          return await createVocdoniElection(
            proposalToElection({metadata, data, census})
          );
        }
      );
      setElectionId(electionId);
      console.log('DEBUG', 'Election created', electionId);

      // 3. Register the proposal onchain
      // todo(kon): Register election to the DAO
      await doStep(
        OffchainProposalStepId.CREATE_ONCHAIN_PROPOSAL,
        async () => await handleOnchainProposal(electionId)
      );
      console.log('DEBUG', 'Proposal offchain created', electionId);

      // 4. All ready
      updateStepStatus(
        OffchainProposalStepId.PROPOSAL_IS_READY,
        StepStatus.SUCCESS
      );
      console.log('DEBUG', 'All done!', globalState, electionId);

      // todo(kon): handle all process is finished (go to the proposal on the ui)
    },
    [
      createAccount,
      createCensus,
      createVocdoniElection,
      daoToken,
      doStep,
      globalState,
      steps,
      setElectionId,
    ]
  );

  return {steps, globalState, createProposal, electionId, cacheProposal};
};

export {useCreateOffchainProposal};
