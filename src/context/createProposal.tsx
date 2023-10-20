import {
  CreateMajorityVotingProposalParams,
  CreateMultisigProposalParams,
  MajorityVotingProposalSettings,
  MajorityVotingSettings,
  MultisigClient,
  MultisigVotingSettings,
  ProposalCreationSteps,
  TokenVotingClient,
  VoteValues,
  WithdrawParams,
} from '@aragon/sdk-client';
import {
  DaoAction,
  ProposalMetadata,
  ProposalStatus,
  TokenType,
  LIVE_CONTRACTS,
  SupportedNetworksArray,
  SupportedVersion,
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
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useTokenSupply} from 'hooks/useTokenSupply';
import {useWallet} from 'hooks/useWallet';
import {trackEvent} from 'services/analytics';
import {useVotingPower} from 'services/aragon-sdk/queries/use-voting-power';
import {
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
import {
  getDefaultPayableAmountInputName,
  toDisplayEns,
  translateToNetworkishName,
} from 'utils/library';
import {proposalStorage} from 'utils/localStorage/proposalStorage';
import {Proposal} from 'utils/paths';
import {getNonEmptyActions} from 'utils/proposals';
import {isNativeToken} from 'utils/tokens';
import {ProposalFormData, ProposalId, ProposalResource} from 'utils/types';
import {useGlobalModalContext} from './globalModals';
import {useNetwork} from './network';
import {useProviders} from './providers';
import {useProtocolVersions} from 'hooks/useDaoVersions';

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
  const translatedNetwork = translateToNetworkishName(network);
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

  const {data: versions} = useProtocolVersions(daoDetails?.address);

  const {client} = useClient();
  const pluginClient = usePluginClient(pluginType);
  const {
    days: minDays,
    hours: minHours,
    minutes: minMinutes,
  } = getDHMFromSeconds((votingSettings as MajorityVotingSettings).minDuration);

  const [proposalId, setProposalId] = useState<string>();
  const [proposalCreationData, setProposalCreationData] =
    useState<CreateMajorityVotingProposalParams>();
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

        case 'os_update': {
          if (
            translatedNetwork !== 'unsupported' &&
            SupportedNetworksArray.includes(translatedNetwork) &&
            daoDetails?.address &&
            versions
          ) {
            const initializeData = client.encoding.initializeFromAction(
              daoDetails?.address as string,
              {
                previousVersion: versions as [number, number, number],
              }
            );

            const daoFactoryAddress =
              LIVE_CONTRACTS[action.inputs.version as SupportedVersion][
                translatedNetwork
              ].daoFactoryAddress;

            const implementationAddress =
              await client.methods.getDaoImplementation(daoFactoryAddress);

            if (initializeData && implementationAddress)
              actions.push(
                Promise.resolve(
                  client.encoding.upgradeToAndCallAction(
                    daoDetails?.address as string,
                    {
                      implementationAddress: implementationAddress, // the implementation address to be upgraded to.
                      data: initializeData.data,
                    }
                  )
                )
              );
          }
          break;
        }
      }
    }

    return Promise.all(actions);
  }, [
    client,
    daoDetails?.address,
    getValues,
    network,
    pluginAddress,
    pluginClient,
    t,
    translatedNetwork,
    versions,
    votingSettings,
  ]);

  // Because getValues does NOT get updated on each render, leaving this as
  // a function to be called when data is needed instead of a memoized value
  const getProposalCreationParams =
    useCallback(async (): Promise<CreateMajorityVotingProposalParams> => {
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
      const startMinutesDelay = isMultisigVotingSettings(votingSettings)
        ? 0
        : 10;

      if (startSwitch === 'now') {
        startDateTime = new Date(
          `${getCanonicalDate()}T${getCanonicalTime({
            minutes: startMinutesDelay,
          })}:00${getCanonicalUtcOffset()}`
        );
      } else {
        startDateTime = new Date(
          `${startDate}T${startTime}:00${getCanonicalUtcOffset(startUtc)}`
        );
      }

      // End date
      let endDateTime;
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
      } else {
        endDateTime = new Date(
          `${endDate}T${endTime}:00${getCanonicalUtcOffset(endUtc)}`
        );
      }

      if (startSwitch === 'now') {
        endDateTime = new Date(
          endDateTime.getTime() + minutesToMills(startMinutesDelay)
        );
      } else {
        if (startDateTime.valueOf() < new Date().valueOf()) {
          startDateTime = new Date(
            `${getCanonicalDate()}T${getCanonicalTime({
              minutes: startMinutesDelay,
            })}:00${getCanonicalUtcOffset()}`
          );
        }

        const minEndDateTimeMills =
          startDateTime.valueOf() +
          daysToMills(minDays || 0) +
          hoursToMills(minHours || 0) +
          minutesToMills(minMinutes || 0);

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
       * For multisig proposals, in case "now" as start time is selected, we want
       * to keep startDate undefined, so it's automatically evaluated.
       * If we just provide "Date.now()", than after user still goes through the flow
       * it's going to be date from the past. And SC-call evaluation will fail.
       */
      const finalStartDate =
        startSwitch === 'now' && isMultisigVotingSettings(votingSettings)
          ? undefined
          : startDateTime;

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
      votingSettings,
    ]);

  const estimateCreationFees = useCallback(async () => {
    if (!pluginClient) {
      return Promise.reject(
        new Error('ERC20 SDK client is not initialized correctly')
      );
    }
    if (!proposalCreationData) return;

    return pluginClient?.estimation.createProposal(proposalCreationData);
  }, [pluginClient, proposalCreationData]);

  const {
    tokenPrice,
    maxFee,
    averageFee,
    stopPolling,
    error: gasEstimationError,
  } = usePollGasFee(estimateCreationFees, shouldPoll);

  const handleCloseModal = useCallback(() => {
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
  }, [
    creationProcessState,
    daoDetails?.address,
    daoDetails?.ensDomain,
    navigate,
    network,
    proposalId,
    setShowTxModal,
    stopPolling,
  ]);

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
        };
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

  const invalidateQueries = useCallback(() => {
    // invalidating all infinite proposals query regardless of the
    // pagination state
    queryClient.invalidateQueries([AragonSdkQueryItem.PROPOSALS]);
  }, [queryClient]);

  const handlePublishProposal = useCallback(async () => {
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

    const proposalIterator =
      pluginClient.methods.createProposal(proposalCreationData);

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
      for await (const step of proposalIterator) {
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
            handleCacheProposal(prefixedId);
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
    }
  }, [
    averageFee,
    creationProcessState,
    daoDetails?.address,
    handleCacheProposal,
    handleCloseModal,
    invalidateQueries,
    isOnWrongNetwork,
    network,
    open,
    pluginAddress,
    pluginClient,
    proposalCreationData,
    provider?.connection.url,
    tokenPrice,
  ]);

  /*************************************************
   *                     Effects                   *
   *************************************************/
  useEffect(() => {
    // set proposal creation data
    async function setProposalData() {
      if (showTxModal && creationProcessState === TransactionState.WAITING)
        setProposalCreationData(await getProposalCreationParams());
      else if (!showTxModal) setProposalCreationData(undefined);
    }

    setProposalData();
  }, [creationProcessState, getProposalCreationParams, showTxModal]);

  /*************************************************
   *                    Render                     *
   *************************************************/

  if (daoDetailsLoading) {
    return <Loading />;
  }

  return (
    <>
      {children}
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
        buttonLabel={t('TransactionModal.createProposal')}
        buttonLabelSuccess={t('TransactionModal.goToProposal')}
        disabledCallback={disableActionButton}
      />
    </>
  );
};

export {CreateProposalWrapper as CreateProposalProvider};
