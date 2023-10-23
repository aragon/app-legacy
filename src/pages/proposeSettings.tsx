import {
  CreateMajorityVotingProposalParams,
  CreateMultisigProposalParams,
  MajorityVotingProposalSettings,
  ProposalCreationSteps,
  VoteValues,
  VotingMode,
  VotingSettings,
} from '@aragon/sdk-client';
import {
  DaoAction,
  ProposalMetadata,
  ProposalStatus,
} from '@aragon/sdk-client-common';
import {useQueryClient} from '@tanstack/react-query';
import differenceInSeconds from 'date-fns/fp/differenceInSeconds';
import {parseUnits} from 'ethers/lib/utils';
import React, {ReactNode, useCallback, useEffect, useState} from 'react';
import {useFormContext, useFormState} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import {Loading} from 'components/temporary';
import CompareSettings from 'containers/compareSettings';
import DefineProposal, {
  isValid as defineProposalIsValid,
} from 'containers/defineProposal';
import ReviewProposal from 'containers/reviewProposal';
import SetupVotingForm from 'containers/setupVotingForm';
import PublishModal from 'containers/transactionModals/publishModal';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {useClient} from 'hooks/useClient';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoToken} from 'hooks/useDaoToken';
import {
  PluginTypes,
  isMultisigClient,
  isTokenVotingClient,
  usePluginClient,
} from 'hooks/usePluginClient';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useTokenSupply} from 'hooks/useTokenSupply';
import {useWallet} from 'hooks/useWallet';
import {useVotingPower} from 'services/aragon-sdk/queries/use-voting-power';
import {
  isMultisigVotingSettings,
  isTokenVotingSettings,
  useVotingSettings,
} from 'services/aragon-sdk/queries/use-voting-settings';
import {AragonSdkQueryItem} from 'services/aragon-sdk/query-keys';
import {CHAIN_METADATA, TransactionState} from 'utils/constants';
import {
  daysToMills,
  getCanonicalDate,
  getCanonicalTime,
  getCanonicalUtcOffset,
  getDHMFromSeconds,
  getSecondsFromDHM,
  hoursToMills,
  minutesToMills,
  offsetToMills,
} from 'utils/date';
import {readFile, toDisplayEns} from 'utils/library';
import {proposalStorage} from 'utils/localStorage/proposalStorage';
import {EditSettings, Proposal, Settings} from 'utils/paths';
import {
  Action,
  ActionUpdateMetadata,
  ActionUpdateMultisigPluginSettings,
  ActionUpdatePluginSettings,
  ProposalId,
  ProposalResource,
  ProposalSettingsFormData,
} from 'utils/types';

export const ProposeSettings: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  const {getValues, setValue, control} =
    useFormContext<ProposalSettingsFormData>();
  const [showTxModal, setShowTxModal] = useState(false);
  const {errors, dirtyFields} = useFormState({
    control,
  });

  const {data: daoDetails, isLoading: daoDetailsLoading} = useDaoDetailsQuery();
  const {data: pluginSettings, isLoading: settingsLoading} = useVotingSettings({
    pluginAddress: daoDetails?.plugins[0].instanceAddress as string,
    pluginType: daoDetails?.plugins[0].id as PluginTypes,
  });

  const enableTxModal = () => {
    setShowTxModal(true);
  };

  // filter actions making sure unchanged information is not bundled
  // into the list of actions
  const filterActions = useCallback(() => {
    const [formActions, settingsChanged, metadataChanged] = getValues([
      'actions',
      'areSettingsChanged',
      'isMetadataChanged',
    ]);

    // ignore every action that is not modifying the metadata and voting settings
    const filteredActions = (formActions as Array<Action>).filter(action => {
      if (action.name === 'modify_metadata' && metadataChanged) {
        return action;
      } else if (
        (action.name === 'modify_token_voting_settings' ||
          action.name === 'modify_multisig_voting_settings') &&
        settingsChanged
      ) {
        return action;
      }
    });

    setValue('actions', filteredActions);
  }, [getValues, setValue]);

  if (daoDetailsLoading || settingsLoading) {
    return <Loading />;
  }

  if (!pluginSettings || !daoDetails) {
    return null;
  }

  return (
    <ProposeSettingWrapper
      showTxModal={showTxModal}
      setShowTxModal={setShowTxModal}
    >
      <FullScreenStepper
        wizardProcessName={t('newProposal.title')}
        navLabel={t('navLinks.settings')}
        returnPath={generatePath(Settings, {
          network,
          dao: toDisplayEns(daoDetails.ensDomain) || daoDetails.address,
        })}
      >
        <Step
          wizardTitle={t('settings.proposeSettings')}
          wizardDescription={t('settings.proposeSettingsSubtitle')}
          onNextButtonClicked={next => {
            filterActions();
            next();
          }}
        >
          <CompareSettings />
        </Step>
        <Step
          wizardTitle={t('newWithdraw.defineProposal.heading')}
          wizardDescription={t('newWithdraw.defineProposal.description')}
          isNextButtonDisabled={!defineProposalIsValid(dirtyFields, errors)}
        >
          <DefineProposal />
        </Step>
        <Step
          wizardTitle={t('newWithdraw.setupVoting.title')}
          wizardDescription={t('newWithdraw.setupVoting.description')}
        >
          <SetupVotingForm pluginSettings={pluginSettings} />
        </Step>
        <Step
          wizardTitle={t('newWithdraw.reviewProposal.heading')}
          wizardDescription={t('newWithdraw.reviewProposal.description')}
          nextButtonLabel={t('labels.submitProposal')}
          onNextButtonClicked={enableTxModal}
          fullWidth
        >
          <ReviewProposal defineProposalStepNumber={2} />
        </Step>
      </FullScreenStepper>
    </ProposeSettingWrapper>
  );
};

type Props = {
  showTxModal: boolean;
  setShowTxModal: (value: boolean) => void;
  children: ReactNode;
};

// TODO: this is almost identical to CreateProposal wrapper, please merge if possible
const ProposeSettingWrapper: React.FC<Props> = ({
  showTxModal,
  setShowTxModal,
  children,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {getValues, setValue} = useFormContext();
  const {api: apiProvider} = useProviders();

  const {network} = useNetwork();
  const {address, isOnWrongNetwork} = useWallet();

  const {data: daoDetails, isLoading: daoDetailsLoading} = useDaoDetailsQuery();
  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;

  const {data: votingSettings} = useVotingSettings({pluginAddress, pluginType});
  const {data: daoToken} = useDaoToken(pluginAddress);
  const {data: votingPower} = useVotingPower(
    {tokenAddress: daoToken?.address as string, address: address as string},
    {enabled: !!daoToken?.address && !!address}
  );

  const {
    days: minDays,
    hours: minHours,
    minutes: minMinutes,
  } = getDHMFromSeconds((votingSettings as VotingSettings)?.minDuration ?? 0);

  const {data: tokenSupply, isLoading: tokenSupplyIsLoading} = useTokenSupply(
    daoToken?.address || ''
  );

  const {client} = useClient();
  const pluginClient = usePluginClient(pluginType);

  const [proposalCreationData, setProposalCreationData] =
    useState<CreateMajorityVotingProposalParams>();

  const [creationProcessState, setCreationProcessState] =
    useState<TransactionState>(TransactionState.WAITING);

  const [proposalId, setProposalId] = useState<string>();

  const shouldPoll =
    creationProcessState === TransactionState.WAITING &&
    proposalCreationData !== undefined;

  const disableActionButton =
    !proposalCreationData && creationProcessState !== TransactionState.SUCCESS;

  /*************************************************
   *                     Effects                   *
   *************************************************/
  // Not a fan, but this sets the actions on the form context so that the Action
  // Widget can read them
  useEffect(() => {
    async function SetSettingActions() {
      {
        const [
          daoName,
          daoSummary,
          daoLogo,
          minimumApproval,
          multisigMinimumApprovals,
          minimumParticipation,
          eligibilityType,
          eligibilityTokenAmount,
          earlyExecution,
          voteReplacement,
          durationDays,
          durationHours,
          durationMinutes,
          resourceLinks,
          tokenDecimals,
        ] = getValues([
          'daoName',
          'daoSummary',
          'daoLogo',
          'minimumApproval',
          'multisigMinimumApprovals',
          'minimumParticipation',
          'eligibilityType',
          'eligibilityTokenAmount',
          'earlyExecution',
          'voteReplacement',
          'durationDays',
          'durationHours',
          'durationMinutes',
          'daoLinks',
          'tokenDecimals',
        ]);

        let daoLogoFile = '';

        if (daoDetails && !daoName)
          navigate(
            generatePath(EditSettings, {network, dao: daoDetails?.address})
          );

        if (daoLogo?.startsWith?.('blob'))
          daoLogoFile = (await fetch(daoLogo).then(r => r.blob())) as string;
        else daoLogoFile = daoLogo;

        const metadataAction: ActionUpdateMetadata = {
          name: 'modify_metadata',
          inputs: {
            name: daoName,
            description: daoSummary,
            avatar: daoLogoFile,
            links: resourceLinks,
          },
        };

        if (isTokenVotingSettings(votingSettings)) {
          const voteSettingsAction: ActionUpdatePluginSettings = {
            name: 'modify_token_voting_settings',
            inputs: {
              token: daoToken,
              totalVotingWeight: tokenSupply?.raw || BigInt(0),

              minDuration: getSecondsFromDHM(
                durationDays,
                durationHours,
                durationMinutes
              ),
              supportThreshold: Number(minimumApproval) / 100,
              minParticipation: Number(minimumParticipation) / 100,
              minProposerVotingPower:
                eligibilityType === 'token'
                  ? parseUnits(
                      eligibilityTokenAmount.toString(),
                      tokenDecimals
                    ).toBigInt()
                  : undefined,
              votingMode: earlyExecution
                ? VotingMode.EARLY_EXECUTION
                : voteReplacement
                ? VotingMode.VOTE_REPLACEMENT
                : VotingMode.STANDARD,
            },
          };
          setValue('actions', [metadataAction, voteSettingsAction]);
        } else {
          const multisigSettingsAction: ActionUpdateMultisigPluginSettings = {
            name: 'modify_multisig_voting_settings',
            inputs: {
              minApprovals: multisigMinimumApprovals,
              onlyListed: eligibilityType === 'multisig',
            },
          };

          setValue('actions', [metadataAction, multisigSettingsAction]);
        }
      }
    }

    SetSettingActions();
  }, [
    daoToken,
    votingSettings,
    getValues,
    setValue,
    tokenSupply?.raw,
    daoDetails,
    navigate,
    network,
  ]);

  useEffect(() => {
    // encoding actions
    const encodeActions = async (): Promise<DaoAction[]> => {
      // return an empty array for undefined clients
      const actions: Array<Promise<DaoAction>> = [];
      if (!pluginClient || !client || !daoDetails?.address)
        return Promise.all(actions);

      for (const action of getValues('actions') as Array<Action>) {
        if (action.name === 'modify_metadata') {
          const preparedAction = {...action};

          if (
            preparedAction.inputs.avatar &&
            typeof preparedAction.inputs.avatar !== 'string'
          ) {
            try {
              const daoLogoBuffer = await readFile(
                preparedAction.inputs.avatar as unknown as Blob
              );

              const logoCID = await client?.ipfs.add(
                new Uint8Array(daoLogoBuffer)
              );
              await client?.ipfs.pin(logoCID!);
              preparedAction.inputs.avatar = `ipfs://${logoCID}`;
            } catch (e) {
              preparedAction.inputs.avatar = undefined;
            }
          }

          try {
            const ipfsUri = await client.methods.pinMetadata(
              preparedAction.inputs
            );

            actions.push(
              client.encoding.updateDaoMetadataAction(
                daoDetails.address,
                ipfsUri
              )
            );
          } catch (error) {
            throw Error('Could not pin metadata on IPFS');
          }
        } else if (
          action.name === 'modify_token_voting_settings' &&
          isTokenVotingClient(pluginClient)
        ) {
          actions.push(
            Promise.resolve(
              pluginClient.encoding.updatePluginSettingsAction(
                pluginAddress,
                action.inputs
              )
            )
          );
        } else if (
          action.name === 'modify_multisig_voting_settings' &&
          isMultisigClient(pluginClient)
        ) {
          actions.push(
            Promise.resolve(
              pluginClient.encoding.updateMultisigVotingSettings({
                pluginAddress,
                votingSettings: {
                  minApprovals: action.inputs.minApprovals,
                  onlyListed: action.inputs.onlyListed,
                },
              })
            )
          );
        }
      }
      return Promise.all(actions);
    };

    const getProposalCreationParams =
      async (): Promise<CreateMajorityVotingProposalParams> => {
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

        const ipfsUri = await pluginClient?.methods.pinMetadata(metadata);

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
            startDateTime.valueOf() + offsetToMills({days, hours, minutes});

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
        const finalStartDate =
          startSwitch === 'now' ? undefined : startDateTime;

        // Ignore encoding if the proposal had no actions
        return {
          pluginAddress,
          metadataUri: ipfsUri || '',
          startDate: finalStartDate,
          endDate: endDateTime,
          actions,
        };
      };

    async function setProposalData() {
      if (showTxModal && creationProcessState === TransactionState.WAITING)
        setProposalCreationData(await getProposalCreationParams());
    }

    if (daoDetails?.address) {
      setProposalData();
    }
  }, [
    client,
    creationProcessState,
    daoDetails?.address,
    getValues,
    minDays,
    minHours,
    minMinutes,
    pluginAddress,
    pluginClient,
    votingSettings,
    showTxModal,
  ]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const estimateCreationFees = useCallback(async () => {
    if (!pluginClient) {
      return Promise.reject(
        new Error('ERC20 SDK client is not initialized correctly')
      );
    }
    if (!proposalCreationData) return;

    // todo(kon): implement this
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return pluginClient?.estimation.createProposal(proposalCreationData);
  }, [pluginClient, proposalCreationData]);

  const {
    tokenPrice,
    maxFee,
    averageFee,
    stopPolling,
    error: gasEstimationError,
  } = usePollGasFee(estimateCreationFees, shouldPoll);

  const handleCloseModal = () => {
    switch (creationProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        navigate(
          generatePath(Proposal, {
            network,
            dao: toDisplayEns(daoDetails?.ensDomain) || daoDetails?.address,
            id: proposalId,
          })
        );
        break;
      default: {
        setCreationProcessState(TransactionState.WAITING);
        setShowTxModal(false);
        stopPolling();
      }
    }
  };

  const invalidateQueries = useCallback(() => {
    // invalidating all infinite proposals query regardless of the
    // pagination state
    queryClient.invalidateQueries([AragonSdkQueryItem.PROPOSALS]);
  }, [queryClient]);

  const handlePublishSettings = async () => {
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

    // let proposalIterator: AsyncGenerator<ProposalCreationStepValue>;
    // if (isOffchainVotingClient(pluginClient)) {
    //   proposalIterator = (
    //     pluginClient as OffchainVotingClient
    //   ).methods.createProposal(
    //     proposalCreationData as CreateGasslessProposalParams
    //   );
    // } else {
    //   proposalIterator =
    //     pluginClient.methods.createProposal(proposalCreationData);
    // }

    // todo(kon): implement this
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const proposalIterator =
      pluginClient.methods.createProposal(proposalCreationData as any);

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
    try {
      for await (const step of proposalIterator) {
        switch (step.key) {
          case ProposalCreationSteps.CREATING:
            console.log(step.txHash);
            break;
          case ProposalCreationSteps.DONE: {
            //TODO: replace with step.proposal id when SDK returns proper format
            const proposalGuid = new ProposalId(
              step.proposalId
            ).makeGloballyUnique(pluginAddress);

            setProposalId(proposalGuid);
            setCreationProcessState(TransactionState.SUCCESS);

            // cache proposal
            handleCacheProposal(proposalGuid);
            invalidateQueries();
            break;
          }
        }
      }
    } catch (error) {
      console.error(error);
      setCreationProcessState(TransactionState.ERROR);
    }
  };

  const handleCacheProposal = useCallback(
    async (proposalId: string) => {
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
        startDate: proposalCreationData.startDate ?? new Date(),
        endDate: proposalCreationData.endDate!,
        metadata: {
          title,
          summary,
          description,
          resources: resources.filter((r: ProposalResource) => r.name && r.url),
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
        };
        proposalStorage.addProposal(CHAIN_METADATA[network].id, proposal);
      }

      // token voting
      else if (isTokenVotingSettings(votingSettings)) {
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
        };
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

  /*************************************************
   *                    Render                     *
   *************************************************/
  const buttonLabels = {
    [TransactionState.SUCCESS]: t('TransactionModal.goToProposal'),
    [TransactionState.WAITING]: t('TransactionModal.createProposalNow'),
  };

  if (daoDetailsLoading || tokenSupplyIsLoading) {
    return <Loading />;
  }

  return (
    <>
      {children}
      <PublishModal
        state={creationProcessState || TransactionState.WAITING}
        isOpen={showTxModal}
        onClose={handleCloseModal}
        callback={handlePublishSettings}
        closeOnDrag={creationProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        gasEstimationError={gasEstimationError}
        tokenPrice={tokenPrice}
        title={t('TransactionModal.createProposal')}
        buttonStateLabels={buttonLabels}
        disabledCallback={disableActionButton}
      />
    </>
  );
};
