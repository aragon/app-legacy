import {
  CreateMajorityVotingProposalParams,
  Erc20TokenDetails,
  Erc20WrapperTokenDetails,
} from '@aragon/sdk-client';
import {ProposalMetadata} from '@aragon/sdk-client-common';
import React, {useCallback, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {
  OffchainPluginLocalStorageKeys,
  OffchainPluginLocalStorageTypes,
  proposalToElection,
  UseCreateElectionProps,
} from 'hooks/useVocdoniElection';
import {useClient as useVocdoniClient} from 'hooks/useVocdoniSdk';
import {
  AccountData,
  Election,
  ErrAccountNotFound,
  ErrAPI,
  UnpublishedElection,
} from '@vocdoni/sdk';
import {VoteValues} from '@aragon/sdk-client';

// todo(kon): move this types somewhere else
export enum OffchainProposalStepId {
  REGISTER_VOCDONI_ACCOUNT = 'REGISTER_VOCDONI_ACCOUNT',
  CREATE_VOCDONI_ELECTION = 'CREATE_VOCDONI_ELECTION',
  CREATE_ONCHAIN_PROPOSAL = 'CREATE_ONCHAIN_PROPOSAL',
  PROPOSAL_IS_READY = 'PROPOSAL_IS_READY',
}

export enum StepStatus {
  WAITING = 'WAITING',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface StepData {
  status: StepStatus;
  errorMessage?: string;
}

export type OffchainProposalSteps = {
  [key in OffchainProposalStepId]: StepData;
};

type ICreateOffchainProposal = {
  daoToken: Erc20TokenDetails | Erc20WrapperTokenDetails | undefined;
};

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

  const [steps, setSteps] = useState<OffchainProposalSteps>({
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
  } as OffchainProposalSteps);

  const globalState: StepStatus = useMemo(() => {
    const stepsArray = Object.values(steps);
    // If any step has an ERROR status, return ERROR
    if (stepsArray.some(step => step.status === StepStatus.ERROR)) {
      return StepStatus.ERROR;
    }

    // If any step has a LOADING status, return LOADING
    if (stepsArray.some(step => step.status === StepStatus.LOADING)) {
      return StepStatus.LOADING;
    }

    // If all steps have a SUCCESS status, return SUCCESS
    if (stepsArray.every(step => step.status === StepStatus.SUCCESS)) {
      return StepStatus.SUCCESS;
    }

    // If all steps have a WAITING status, return WAITING
    if (stepsArray.every(step => step.status === StepStatus.WAITING)) {
      return StepStatus.WAITING;
    }

    return StepStatus.ERROR;
  }, [steps]);

  const updateStepStatus = (
    stepId: OffchainProposalStepId,
    status: StepStatus
  ) => {
    setSteps(prevSteps => ({
      ...prevSteps,
      [stepId]: {
        ...prevSteps[stepId],
        status: status,
      },
    }));
  };

  const doStep = async <T,>(
    stepId: OffchainProposalStepId,
    callback: () => Promise<T>
  ): Promise<T> => {
    let res: T;
    try {
      updateStepStatus(stepId, StepStatus.LOADING);
      res = await callback();
    } catch (e) {
      updateStepStatus(stepId, StepStatus.ERROR);
      throw e;
    }
    updateStepStatus(stepId, StepStatus.SUCCESS);
    return res;
  };

  const {client: vocdoniClient, census3Client} = useVocdoniClient();

  const createVocdoniElection = useCallback(
    async (electionData: UseCreateElectionProps) => {
      const election: UnpublishedElection = Election.from({
        title: electionData.title,
        description: electionData.description,
        endDate: electionData.endDate,
        startDate: electionData.startDate,
        census: electionData.census,
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
      try {
        console.log('DEBUG', 'trying to create', election);
        return await vocdoniClient.createElection(election);
      } catch (e) {
        // todo(kon): replace error handling
        if ((e as string).includes('not enough balance to transfer')) {
          console.log('DEBUG', 'error, collecting faucet', election);
          // todo(kon): do an estimation and collect tokens as many as needed
          await vocdoniClient.collectFaucetTokens();
          console.log('DEBUG', 'faucet collected', election);
          return await vocdoniClient.createElection(election);
          console.log('DEBUG', 'election created after faucet collected');
        } else throw e;
      }
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
    // Check if the census is already sync
    // todo(kon): this have to be moved on DAO creation process
    try {
      await census3Client.createToken(daoToken!.address, 'erc20');
    } catch (e) {
      // todo(kon): replace error handling when the api return code error is fixed. Now is a generic 500
      if (
        e instanceof ErrAPI &&
        e.message.includes('error creating token with address')
      ) {
        console.log('DEBUG', 'Token already created');
      } else throw e;
    }

    const censusToken = await census3Client.getToken(daoToken!.address);

    console.log('DEBUG', 'Census', censusToken);
    // todo(kon): handle token is not sync
    if (!censusToken.status.synced) {
      throw Error('Census token is not already calculated');
    }

    // Create the vocdoni census
    console.log('DEBUG', 'Creating vocdoni census');
    return await census3Client.createTokenCensus(censusToken.id);
  }, [census3Client, daoToken]);

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
