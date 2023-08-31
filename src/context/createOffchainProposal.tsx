import {useReactiveVar} from '@apollo/client';
import {
  CreateMajorityVotingProposalParams,
  Erc20TokenDetails,
  Erc20WrapperTokenDetails,
  InstalledPluginListItem,
  MultisigClient,
  MultisigVotingSettings,
  ProposalCreationSteps,
  TokenVotingClient,
  VotingSettings,
  WithdrawParams,
} from '@aragon/sdk-client';
import {
  DaoAction,
  ProposalMetadata,
  TokenType,
} from '@aragon/sdk-client-common';
import {hexToBytes} from '@aragon/sdk-common';
import {ethers} from 'ethers';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import {Loading} from 'components/temporary';
import PublishModal from 'containers/transactionModals/publishModal';
import {useClient} from 'hooks/useClient';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoToken} from 'hooks/useDaoToken';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import {
  isMultisigVotingSettings,
  isTokenVotingSettings,
  usePluginSettings,
} from 'hooks/usePluginSettings';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useTokenSupply} from 'hooks/useTokenSupply';
import {useWallet} from 'hooks/useWallet';
import {trackEvent} from 'services/analytics';
import {getEtherscanVerifiedContract} from 'services/etherscanAPI';
import {
  PENDING_MULTISIG_PROPOSALS_KEY,
  PENDING_PROPOSALS_KEY,
  TransactionState,
} from 'utils/constants';
import {
  daysToMills,
  getCanonicalDate,
  getCanonicalTime,
  getCanonicalUtcOffset,
  getDHMFromSeconds,
  hoursToMills,
  minutesToMills,
  offsetToMills,
} from 'utils/date';
import {
  customJSONReplacer,
  getDefaultPayableAmountInputName,
  toDisplayEns,
} from 'utils/library';
import {Proposal} from 'utils/paths';
import {
  CacheProposalParams,
  getNonEmptyActions,
  mapToCacheProposal,
} from 'utils/proposals';
import {isNativeToken} from 'utils/tokens';
import {ProposalId, ProposalResource} from 'utils/types';
import {
  pendingMultisigProposalsVar,
  pendingTokenBasedProposalsVar,
} from './apolloClient';
import {useGlobalModalContext} from './globalModals';
import {useNetwork} from './network';
import {usePrivacyContext} from './privacyContext';
import {
  proposalToElection,
  UseCreateElectionProps,
} from 'hooks/useVocdoniElection';
import {useClient as useVocdoniClient} from 'hooks/useVocdoniSdk';
import {
  AccountData,
  Census,
  Election,
  ErrAccountNotFound,
  ErrAPI,
  UnpublishedElection,
} from '@vocdoni/sdk';

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
  const {t, i18n} = useTranslation();

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
      election.addQuestion(electionData.question, '', [
        {title: 'Yes', value: 0},
        {title: 'No', value: 1},
        {title: 'Abstain', value: 2},
      ]);
      // todo(kon): handle how collect faucet have to work
      try {
        return await vocdoniClient.createElection(election);
      } catch (e) {
        // todo(kon): replace error handling
        if ((e as string).includes('not enough balance to transfer')) {
          console.log('DEBUG', 'error, collecting faucet');
          await vocdoniClient.collectFaucetTokens();
          return await vocdoniClient.createElection(election);
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
      data: CreateMajorityVotingProposalParams
    ) => {
      console.log('DEBUG', 'Start creating a proposal');

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
      console.log('DEBUG', 'Election created', electionId);

      // 3 Register the proposal onchain
      // todo(kon): Register election to the DAO
      updateStepStatus(
        OffchainProposalStepId.CREATE_ONCHAIN_PROPOSAL,
        StepStatus.SUCCESS
      );
      updateStepStatus(
        OffchainProposalStepId.PROPOSAL_IS_READY,
        StepStatus.SUCCESS
      );
    },
    [createAccount, createCensus, daoToken]
  );

  return {steps, globalState, createProposal};
};

export {useCreateOffchainProposal};
