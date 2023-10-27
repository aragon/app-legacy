import {
  CreateMajorityVotingProposalParams,
  CreateMultisigProposalParams,
  MajorityVotingProposalSettings,
  MajorityVotingSettings,
  MultisigClient,
  MultisigProposal,
  MultisigVotingSettings,
  ProposalCreationSteps,
  ProposalCreationStepValue,
  TokenVotingClient,
  TokenVotingProposal,
  VoteValues,
  WithdrawParams,
} from '@aragon/sdk-client';
import {
  DaoAction,
  ProposalMetadata,
  ProposalStatus,
  TokenType,
  hexToBytes,
} from '@aragon/sdk-client-common';
import {useQueryClient} from '@tanstack/react-query';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import {ethers} from 'ethers';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import {Loading} from 'components/temporary';
import PublishModal from 'containers/transactionModals/publishModal';
import {useClient} from 'hooks/useClient';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoToken} from 'hooks/useDaoToken';
import {
  GaselessPluginName,
  PluginTypes,
  usePluginClient,
} from 'hooks/usePluginClient';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useTokenSupply} from 'hooks/useTokenSupply';
import {useWallet} from 'hooks/useWallet';
import {trackEvent} from 'services/analytics';
import {useVotingPower} from 'services/aragon-sdk/queries/use-voting-power';
import {
  isGaslessVotingSettings,
  isMultisigVotingSettings,
  isTokenVotingSettings,
  useVotingSettings,
} from 'services/aragon-sdk/queries/use-voting-settings';
import {AragonSdkQueryItem} from 'services/aragon-sdk/query-keys';
import {getEtherscanVerifiedContract} from 'services/etherscanAPI';
import {CHAIN_METADATA, TransactionState} from 'utils/constants';
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
import {getDefaultPayableAmountInputName, toDisplayEns} from 'utils/library';
import {proposalStorage} from 'utils/localStorage/proposalStorage';
import {Proposal} from 'utils/paths';
import {getNonEmptyActions} from 'utils/proposals';
import {isNativeToken} from 'utils/tokens';
import {ProposalFormData, ProposalId, ProposalResource} from 'utils/types';
import {useGlobalModalContext} from './globalModals';
import {useNetwork} from './network';
import {useProviders} from './providers';
import {useCreateOffchainProposal} from './createOffchainProposal';
import OffchainProposalModal from '../containers/transactionModals/offchainProposalModal';
import {StepStatus} from '../hooks/useFunctionStepper';

import {
  CreateGasslessProposalParams,
  GaslessVotingProposal,
  OffchainVotingClient,
} from '@vocdoni/offchain-voting';

type Props = {
  showTxModal: boolean;
  setShowTxModal: (value: boolean) => void;
  children: ReactNode;
};

const CreateProposalWrapper: React.FC<Props> = ({
  showTxModal,
  setShowTxModal,
  children,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const queryClient = useQueryClient();

  const navigate = useNavigate();
  const {getValues} = useFormContext<ProposalFormData>();

  const {network} = useNetwork();
  const {isOnWrongNetwork, provider, address} = useWallet();
  const {api: apiProvider} = useProviders();

  const {data: daoDetails, isLoading: daoDetailsLoading} = useDaoDetailsQuery();
  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;

  const {data: daoToken} = useDaoToken(pluginAddress);
  const {data: tokenSupply} = useTokenSupply(daoToken?.address || '');
  const {data: votingSettings} = useVotingSettings({pluginAddress, pluginType});
  const {data: votingPower} = useVotingPower(
    {tokenAddress: daoToken?.address as string, address: address as string},
    {enabled: !!daoToken?.address && !!address}
  );

  const {client} = useClient();
  const pluginClient = usePluginClient(pluginType as PluginTypes);

  const offchain = pluginType === GaselessPluginName;

  const {
    days: minDays,
    hours: minHours,
    minutes: minMinutes,
  } = getDHMFromSeconds((votingSettings as MajorityVotingSettings).minDuration);

  const [proposalId, setProposalId] = useState<string>();
  const [proposalCreationData, setProposalCreationData] = useState<
    CreateMajorityVotingProposalParams | CreateGasslessProposalParams
  >();
  const [creationProcessState, setCreationProcessState] =
    useState<TransactionState>(TransactionState.WAITING);

  const shouldPoll = useMemo(
    () =>
      creationProcessState === TransactionState.WAITING &&
      proposalCreationData !== undefined,
    [creationProcessState, proposalCreationData]
  );

  const disableActionButton =
    !proposalCreationData && creationProcessState !== TransactionState.SUCCESS;

  // todo(kon): this code have to be placed somewhere else?
  const {
    steps: offchainProposalSteps,
    globalState: offchainGlobalState,
    createProposal,
    // cacheProposal: cacheOffchainProposal,
  } = useCreateOffchainProposal({
    daoToken,
  });

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const encodeActions = useCallback(async () => {
    const actionsFromForm = getValues('actions');
    const actions: Array<Promise<DaoAction>> = [];

    // return an empty array for undefined clients
    if (!pluginClient || !client) return Promise.resolve([] as DaoAction[]);

    for await (const action of getNonEmptyActions(actionsFromForm)) {
      switch (action.name) {
        case 'withdraw_assets': {
          actions.push(
            client.encoding.withdrawAction({
              amount: BigInt(
                ethers.utils
                  .parseUnits(action.amount.toString(), action.tokenDecimals)
                  .toString()
              ),

              recipientAddressOrEns: action.to.address,
              ...(isNativeToken(action.tokenAddress)
                ? {type: TokenType.NATIVE}
                : {type: TokenType.ERC20, tokenAddress: action.tokenAddress}),
            } as WithdrawParams)
          );
          break;
        }
        case 'mint_tokens': {
          action.inputs.mintTokensToWallets.forEach(mint => {
            actions.push(
              Promise.resolve(
                (pluginClient as TokenVotingClient).encoding.mintTokenAction(
                  action.summary.daoTokenAddress as string,
                  {
                    address: mint.web3Address.address,
                    amount: BigInt(
                      ethers.utils
                        .parseUnits(mint.amount.toString(), 18)
                        .toString()
                    ),
                  }
                )
              )
            );
          });
          break;
        }
        case 'add_address': {
          const wallets = action.inputs.memberWallets.map(
            wallet => wallet.address
          );
          actions.push(
            Promise.resolve(
              (pluginClient as MultisigClient).encoding.addAddressesAction({
                pluginAddress: pluginAddress,
                members: wallets,
              })
            )
          );
          break;
        }
        case 'remove_address': {
          const wallets = action.inputs.memberWallets.map(
            wallet => wallet.address
          );
          if (wallets.length > 0)
            actions.push(
              Promise.resolve(
                (pluginClient as MultisigClient).encoding.removeAddressesAction(
                  {
                    pluginAddress: pluginAddress,
                    members: wallets,
                  }
                )
              )
            );
          break;
        }
        case 'modify_multisig_voting_settings': {
          actions.push(
            Promise.resolve(
              (
                pluginClient as MultisigClient
              ).encoding.updateMultisigVotingSettings({
                pluginAddress: pluginAddress,
                votingSettings: {
                  minApprovals: action.inputs.minApprovals,
                  onlyListed: (votingSettings as MultisigVotingSettings)
                    .onlyListed,
                },
              })
            )
          );
          break;
        }
        case 'external_contract_action': {
          const etherscanData = await getEtherscanVerifiedContract(
            action.contractAddress,
            network
          );

          if (
            etherscanData.status === '1' &&
            etherscanData.result[0].ABI !== 'Contract source code not verified'
          ) {
            const functionParams = action.inputs
              .filter(
                // ignore payable value
                input => input.name !== getDefaultPayableAmountInputName(t)
              )
              .map(input => {
                const param = input.value;

                if (typeof param === 'string' && param.indexOf('[') === 0) {
                  return JSON.parse(param);
                }
                return param;
              });

            const iface = new ethers.utils.Interface(
              etherscanData.result[0].ABI
            );
            const hexData = iface.encodeFunctionData(
              action.functionName,
              functionParams
            );

            actions.push(
              Promise.resolve({
                to: action.contractAddress,
                value: ethers.utils.parseEther(action.value || '0').toBigInt(),
                data: hexToBytes(hexData),
              })
            );
          }
          break;
        }
        case 'wallet_connect_action':
          // wallet connect actions come with a raw field
          // which is just the data passed by wc itself
          actions.push(
            Promise.resolve({
              // include value in case action does not
              value: BigInt(0),
              ...action.raw,
            })
          );
          break;
      }
    }

    return Promise.all(actions);
  }, [
    getValues,
    pluginClient,
    client,
    pluginAddress,
    votingSettings,
    network,
    t,
  ]);

  // Because getValues does NOT get updated on each render, leaving this as
  // a function to be called when data is needed instead of a memorized value
  const getProposalCreationParams = useCallback(async (): Promise<{
    params: CreateMajorityVotingProposalParams;
    metadata: ProposalMetadata;
  }> => {
    const [
      title,
      summary,
      description,
      resources,
      startDate,
      startTime,
      startUtc,
      endDate,
      endTime,
      endUtc,
      durationSwitch,
      startSwitch,
    ] = getValues([
      'proposalTitle',
      'proposalSummary',
      'proposal',
      'links',
      'startDate',
      'startTime',
      'startUtc',
      'endDate',
      'endTime',
      'endUtc',
      'durationSwitch',
      'startSwitch',
    ]);

    const actions = await encodeActions();

    const metadata: ProposalMetadata = {
      title,
      summary,
      description,
      resources: resources.filter((r: ProposalResource) => r.name && r.url),
    };
    let ipfsUri;
    // Offchain voting store metadata using Vocdoni support
    if (!offchain) {
      ipfsUri = await (pluginClient as TokenVotingClient)?.methods.pinMetadata(
        metadata
      );
    }

      // getting dates
      let startDateTime: Date;

      /**
       * Here we defined base startDate.
       */
      if (startSwitch === 'now') {
        // Taking current time, but we won't pass it to SC cuz it's gonna be outdated. Needed for calculations below.
        startDateTime = new Date(
          `${getCanonicalDate()}T${getCanonicalTime()}:00${getCanonicalUtcOffset()}`
        );
      } else {
        // Taking time user has set.
        startDateTime = new Date(
          `${startDate}T${startTime}:00${getCanonicalUtcOffset(startUtc)}`
        );
      }

      // Minimum allowed end date (if endDate is lower than that SC call fails)
      const minEndDateTimeMills =
        startDateTime.valueOf() +
        daysToMills(minDays || 0) +
        hoursToMills(minHours || 0) +
        minutesToMills(minMinutes || 0);

      // End date
      let endDateTime;

      // user specifies duration in time/second exact way
      if (durationSwitch === 'duration') {
        const [days, hours, minutes] = getValues([
          'durationDays',
          'durationHours',
          'durationMinutes',
        ]);

      // Calculate the end date using duration
      const endDateTimeMill =
        startDateTime.valueOf() +
        offsetToMills({
          days: Number(days),
          hours: Number(hours),
          minutes: Number(minutes),
        });

        endDateTime = new Date(endDateTimeMill);

        // In case the endDate is close to being minimum durable, (and we starting immediately)
        // to avoid passing late-date possibly, we just rely on SDK to set proper Date
        if (
          endDateTime.valueOf() <= minEndDateTimeMills &&
          startSwitch === 'now'
        ) {
          /* Pass enddate as undefined to SDK to auto-calculate min endDate */
          endDateTime = undefined;
        }
      } else {
        // In case exact time specified by user
        endDateTime = new Date(
          `${endDate}T${endTime}:00${getCanonicalUtcOffset(endUtc)}`
        );
      }

      if (startSwitch === 'duration' && endDateTime) {
        // Making sure we are not in past for further calculation
        if (startDateTime.valueOf() < new Date().valueOf()) {
          startDateTime = new Date(
            `${getCanonicalDate()}T${getCanonicalTime()}:00${getCanonicalUtcOffset()}`
          );
        }

        // If provided date is expired
        if (endDateTime.valueOf() < minEndDateTimeMills) {
          const legacyStartDate = new Date(
            `${startDate}T${startTime}:00${getCanonicalUtcOffset(startUtc)}`
          );
          const endMills =
            endDateTime.valueOf() +
            (startDateTime.valueOf() - legacyStartDate.valueOf());

        endDateTime = new Date(endMills);
      }
    }

      /**
       * In case "now" as start time is selected, we want
       * to keep startDate undefined, so it's automatically evaluated.
       * If we just provide "Date.now()", than after user still goes through the flow
       * it's going to be date from the past. And SC-call evaluation will fail.
       */
      const finalStartDate = startSwitch === 'now' ? undefined : startDateTime;

      // Ignore encoding if the proposal had no actions
      return {
        pluginAddress,
        metadataUri: ipfsUri || '',
        startDate: finalStartDate,
        endDate: endDateTime,
        actions,
      };
    }, [
      encodeActions,
      getValues,
      minDays,
      minHours,
      minMinutes,
      pluginAddress,
      pluginClient?.methods,
    ]);

  const getOffChainProposalParams = useCallback(
    (
      params: CreateMajorityVotingProposalParams,
      vochainProposalId: string
    ): CreateGasslessProposalParams => {
      return {
        ...params,
        // If the value is 0 will take the expiration time defined at DAO creation level.
        // We want this because the expiration date is defined when the dao is created.
        // We could define a different expiration date for this proposal but is not designed
        // to do this at ux level.
        expirationDate: 0,
        vochainProposalId,
        startDate: (params.startDate ?? new Date()).getTime(),
        endDate: params.endDate!.getTime(),
      };
    },
    []
  );

  const estimateCreationFees = useCallback(async () => {
    if (!pluginClient) {
      return Promise.reject(
        new Error('ERC20 SDK client is not initialized correctly')
      );
    }
    if (!proposalCreationData) return;

    return offchain
      ? (pluginClient as OffchainVotingClient).estimation.createProposal(
          proposalCreationData as CreateGasslessProposalParams
        )
      : (
          pluginClient as TokenVotingClient | MultisigClient
        ).estimation.createProposal(
          proposalCreationData as CreateMajorityVotingProposalParams
        );
  }, [offchain, pluginClient, proposalCreationData]);

  const {
    tokenPrice,
    maxFee,
    averageFee,
    stopPolling,
    error: gasEstimationError,
  } = usePollGasFee(estimateCreationFees, shouldPoll);

  const handleCloseModal = useCallback(() => {
    if (
      creationProcessState === TransactionState.LOADING ||
      offchainGlobalState === StepStatus.LOADING
    ) {
      return;
    } else if (creationProcessState === TransactionState.SUCCESS) {
      navigate(
        generatePath(Proposal, {
          network,
          dao: toDisplayEns(daoDetails?.ensDomain) || daoDetails?.address,
          id: proposalId,
        })
      );
    } else {
      setCreationProcessState(TransactionState.WAITING);
      setShowTxModal(false);
      stopPolling();
    }
  }, [
    creationProcessState,
    daoDetails?.address,
    daoDetails?.ensDomain,
    navigate,
    network,
    offchainGlobalState,
    proposalId,
    setShowTxModal,
    stopPolling,
  ]);

  const handleCacheProposal = useCallback(
    async (proposalId: string, vochainProposalId?: string) => {
      if (!address || !daoDetails || !votingSettings || !proposalCreationData)
        return;

      const creationBlockNumber = await apiProvider.getBlockNumber();

      const [title, summary, description, resources] = getValues([
        'proposalTitle',
        'proposalSummary',
        'proposal',
        'links',
      ]);

      const baseParams = {
        id: proposalId,
        dao: {address: daoDetails.address, name: daoDetails.metadata.name},
        creationDate: new Date(),
        creatorAddress: address,
        creationBlockNumber,
        startDate: (proposalCreationData.startDate as Date) ?? new Date(), // todo(kon): type incompatibility with gaseless proposal
        endDate: proposalCreationData.endDate! as Date, // todo(kon): type incompatibility with gaseless proposal
        metadata: {
          title,
          summary,
          description,
          resources: resources.filter(r => r.name && r.url),
        },
        actions: proposalCreationData.actions ?? [],
        status: proposalCreationData.startDate
          ? ProposalStatus.PENDING
          : ProposalStatus.ACTIVE,
      };

      if (isMultisigVotingSettings(votingSettings)) {
        const {approve: creatorApproval} =
          proposalCreationData as CreateMultisigProposalParams;

        const proposal = {
          ...baseParams,
          approvals: creatorApproval ? [address] : [],
          settings: votingSettings,
        } as MultisigProposal;
        proposalStorage.addProposal(CHAIN_METADATA[network].id, proposal);
      } else if (isTokenVotingSettings(votingSettings)) {
        const {creatorVote} =
          proposalCreationData as CreateMajorityVotingProposalParams;

        const creatorVotingPower = votingPower?.toBigInt() ?? BigInt(0);

        const result = {
          yes: creatorVote === VoteValues.YES ? creatorVotingPower : BigInt(0),
          no: creatorVote === VoteValues.NO ? creatorVotingPower : BigInt(0),
          abstain:
            creatorVote === VoteValues.ABSTAIN ? creatorVotingPower : BigInt(0),
        };

        let usedVotingWeight = BigInt(0);
        const votes = [];
        if (creatorVote) {
          usedVotingWeight = creatorVotingPower;
          votes.push({
            address,
            vote: creatorVote,
            voteReplaced: false,
            weight: creatorVotingPower,
          });
        }

        const settings: MajorityVotingProposalSettings = {
          supportThreshold: votingSettings.supportThreshold,
          minParticipation: votingSettings.minParticipation,
          duration: differenceInSeconds(
            baseParams.endDate,
            baseParams.startDate
          ),
        };

        const proposal = {
          ...baseParams,
          result,
          settings,
          usedVotingWeight,
          totalVotingWeight: tokenSupply?.raw ?? BigInt(0),
          token: daoToken ?? null,
          votes,
        } as TokenVotingProposal;
        proposalStorage.addProposal(CHAIN_METADATA[network].id, proposal);
      } else if (isGaslessVotingSettings(votingSettings)) {
        const proposal = {
          ...baseParams,
          // todo(kon): is this needed to be implemented?
          // expirationDate: Date;
          executed: false,
          approvers: new Array<string>(),
          vochainProposalId,
          // parameters: GaslessProposalParametersStruct;
          // allowFailureMap: number;
          settings: votingSettings,
          // vochain: {
          //   metadata: PublishedElection;
          //   tally: {
          //     final: boolean;
          //     value: bigint[];
          //     parsed: TokenVotingProposalResult;
          //   };
          // };
          // totalVotingWeight: bigint;
          // totalUsedWeight: bigint;
          participation: {
            currentParticipation: 0,
            currentPercentage: 0,
            missingParticipation: 100,
          },
          token: daoToken,
        } as GaslessVotingProposal;
        proposalStorage.addProposal(CHAIN_METADATA[network].id, proposal);
      }
    },
    [
      address,
      daoDetails,
      votingSettings,
      proposalCreationData,
      apiProvider,
      getValues,
      network,
      votingPower,
      tokenSupply?.raw,
      daoToken,
    ]
  );

  const invalidateQueries = useCallback(() => {
    // invalidating all infinite proposals query regardless of the
    // pagination state
    queryClient.invalidateQueries([AragonSdkQueryItem.PROPOSALS]);
  }, [queryClient]);

  const handlePublishProposal = useCallback(
    // todo(kon): this is a quickfix to update the internal cache with updated data. Delete this attribute when minSDK is ready
    async (vochainProposalId?: string) => {
      if (!pluginClient) {
        return new Error('ERC20 SDK client is not initialized correctly');
      }

      // if no creation data is set, or transaction already running, do nothing.
      if (
        !proposalCreationData ||
        creationProcessState === TransactionState.LOADING
      ) {
        console.log('Transaction is running');
        return;
      }

      trackEvent('newProposal_createNowBtn_clicked', {
        dao_address: daoDetails?.address,
        estimated_gwei_fee: averageFee,
        total_usd_cost: averageFee ? tokenPrice * Number(averageFee) : 0,
      });

      // todo(kon): fix this if needed
      let proposalIterator: AsyncGenerator<ProposalCreationStepValue>;
      if (offchain && vochainProposalId) {
        const proposalParams =
          proposalCreationData as CreateGasslessProposalParams;
        proposalParams.vochainProposalId = vochainProposalId;
        proposalIterator = (
          pluginClient as OffchainVotingClient
        ).methods.createProposal(proposalParams);
      } else {
        proposalIterator = (
          pluginClient as MultisigClient | TokenVotingClient
        ).methods.createProposal(
          proposalCreationData as CreateMajorityVotingProposalParams
        );
      }

      if (creationProcessState === TransactionState.SUCCESS) {
        handleCloseModal();
        return;
      }

      if (isOnWrongNetwork) {
        open('network');
        handleCloseModal();
        return;
      }

      setCreationProcessState(TransactionState.LOADING);

      // NOTE: quite weird, I've had to wrap the entirety of the generator
      // in a try-catch because when the user rejects the transaction,
      // the try-catch block inside the for loop would not catch the error
      // FF - 11/21/2020
      try {
        for await (const step of proposalIterator!) {
          switch (step.key) {
            case ProposalCreationSteps.CREATING:
              console.log(step.txHash);
              trackEvent('newProposal_transaction_signed', {
                dao_address: daoDetails?.address,
                network: network,
                wallet_provider: provider?.connection.url,
              });
              break;
            case ProposalCreationSteps.DONE: {
              //TODO: replace with step.proposal id when SDK returns proper format
              const prefixedId = new ProposalId(
                step.proposalId
              ).makeGloballyUnique(pluginAddress);

              setProposalId(prefixedId);
              setCreationProcessState(TransactionState.SUCCESS);
              trackEvent('newProposal_transaction_success', {
                dao_address: daoDetails?.address,
                network: network,
                wallet_provider: provider?.connection.url,
                proposalId: prefixedId,
              });

              // cache proposal
              handleCacheProposal(prefixedId, vochainProposalId);
              invalidateQueries();

              break;
            }
          }
        }
      } catch (error) {
        console.error(error);
        setCreationProcessState(TransactionState.ERROR);
        trackEvent('newProposal_transaction_failed', {
          dao_address: daoDetails?.address,
          network: network,
          wallet_provider: provider?.connection.url,
          error,
        });
        // Fix to update the StepperModal step status when creating a gasless proposal.
        // If the error is not thrown until the StepperModal, it thinks that the step is finished properly
        // and not show the try again button
        if (vochainProposalId) throw error;
      }
    },
    [
      averageFee,
      creationProcessState,
      daoDetails?.address,
      handleCacheProposal,
      handleCloseModal,
      invalidateQueries,
      isOnWrongNetwork,
      network,
      offchain,
      open,
      pluginAddress,
      pluginClient,
      proposalCreationData,
      provider?.connection.url,
      tokenPrice,
    ]
  );

  const handleOffChainProposal = useCallback(async () => {
    console.log('DEBUG', 'handleOffChainProposal');
    if (!pluginClient || !daoToken) {
      return new Error('ERC20 SDK client is not initialized correctly');
    }
    console.log('DEBUG', 'ERC20 initialized', daoToken);

    const {params, metadata} = await getProposalCreationParams();

    await createProposal(metadata, params, handlePublishProposal);
  }, [
    pluginClient,
    daoToken,
    getProposalCreationParams,
    createProposal,
    handlePublishProposal,
  ]);

  /*************************************************
   *                     Effects                   *
   *************************************************/
  useEffect(() => {
    // set proposal creation data
    async function setProposalData() {
      if (showTxModal && creationProcessState === TransactionState.WAITING) {
        if (offchain) {
          const {params: offchainParams} = await getProposalCreationParams();
          setProposalCreationData(
            getOffChainProposalParams(offchainParams, '')
          );
        } else {
          const {params} = await getProposalCreationParams();
          setProposalCreationData(params);
        }
      } else if (!showTxModal) setProposalCreationData(undefined);
    }

    setProposalData();
  }, [
    creationProcessState,
    getOffChainProposalParams,
    getProposalCreationParams,
    offchain,
    showTxModal,
  ]);

  /*************************************************
   *                    Render                     *
   *************************************************/
  const buttonLabels = {
    [TransactionState.SUCCESS]: t('TransactionModal.goToProposal'),
    [TransactionState.WAITING]: t('TransactionModal.createProposalNow'),
  };

  if (daoDetailsLoading) {
    return <Loading />;
  }

  return (
    <>
      {children}
      {offchain ? (
        <OffchainProposalModal
          steps={offchainProposalSteps}
          globalState={offchainGlobalState}
          isOpen={showTxModal}
          onClose={handleCloseModal}
          callback={handleOffChainProposal}
          closeOnDrag={
            creationProcessState !== TransactionState.LOADING ||
            offchainGlobalState !== StepStatus.LOADING
          }
          maxFee={maxFee}
          averageFee={averageFee}
          gasEstimationError={gasEstimationError}
          tokenPrice={tokenPrice}
          title={t('TransactionModal.createProposal')}
          // buttonLabel={t('TransactionModal.createProposal')}
          // buttonLabelSuccess={t('TransactionModal.goToProposal')}
          // disabledCallback={disableActionButton}
        />
      ) : (
        <PublishModal
          state={creationProcessState || TransactionState.WAITING}
          isOpen={showTxModal}
          onClose={handleCloseModal}
          callback={handlePublishProposal}
          closeOnDrag={creationProcessState !== TransactionState.LOADING}
          maxFee={maxFee}
          averageFee={averageFee}
          gasEstimationError={gasEstimationError}
          tokenPrice={tokenPrice}
          title={t('TransactionModal.createProposal')}
          buttonStateLabels={buttonLabels}
          disabledCallback={disableActionButton}
        />
      )}
    </>
  );
};

export {CreateProposalWrapper as CreateProposalProvider};
