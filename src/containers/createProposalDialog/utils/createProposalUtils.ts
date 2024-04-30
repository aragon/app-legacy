import {MajorityVotingSettings} from '@aragon/sdk-client';
import {VocdoniVoting__factory} from '@vocdoni/gasless-voting-ethers';
import {id} from '@ethersproject/hash';
import {
  DaoAction,
  ProposalMetadata,
  encodeProposalId,
} from '@aragon/sdk-client-common';
import {TokenVoting__factory, Multisig__factory} from '@aragon/osx-ethers';
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
  CreateProposalFormData,
  GaslessProposalCreationParams,
  SupportedVotingSettings,
} from 'utils/types';
import {TransactionReceipt} from 'viem';
import {GaslessPluginName, PluginTypes} from 'hooks/usePluginClient';

export interface IBuildCreateProposalParamsParams {
  values: CreateProposalFormData;
  votingSettings?: SupportedVotingSettings | null;
  isGaslessProposal?: boolean;
  actions?: DaoAction[] | null;
  metadataCid?: string;
  pluginAddress?: string;
}

export interface ICreateProposalParams {
  pluginAddress: string;
  metadataUri: string;
  startDate?: Date;
  endDate?: Date;
  actions: DaoAction[];
}

class CreateProposalUtils {
  formValuesToProposalMetadata = (
    values: CreateProposalFormData
  ): ProposalMetadata => ({
    title: values.proposalTitle,
    summary: values.proposalSummary,
    description: values.proposal,
    resources: values.links.filter(
      ({name, url}) => url != null && name != null
    ),
  });

  getProposalIdFromReceipt = (
    receipt: TransactionReceipt,
    pluginType: PluginTypes,
    pluginAddress: string
  ) => {
    const tokenVotingContractInterface = TokenVoting__factory.createInterface();
    const multisigContractInterface = Multisig__factory.createInterface();
    const vocdoniContractInterface = VocdoniVoting__factory.createInterface();

    const contractInterface =
      pluginType === 'multisig.plugin.dao.eth'
        ? multisigContractInterface
        : pluginType === GaslessPluginName
        ? vocdoniContractInterface
        : tokenVotingContractInterface;

    const log = receipt?.logs?.find(
      event =>
        event.topics[0] ===
        id(contractInterface.getEvent('ProposalCreated').format('sighash'))
    );

    const parsedLog = log ? contractInterface.parseLog(log) : undefined;
    const proposalId = parsedLog?.args['proposalId'];

    return encodeProposalId(pluginAddress, Number(proposalId));
  };

  buildCreateProposalParams = (
    params: IBuildCreateProposalParamsParams
  ): ICreateProposalParams | GaslessProposalCreationParams | undefined => {
    const {
      values,
      votingSettings,
      isGaslessProposal,
      actions,
      metadataCid,
      pluginAddress,
    } = params;

    if (
      votingSettings == null ||
      (metadataCid == null && !isGaslessProposal) ||
      pluginAddress == null ||
      actions == null
    ) {
      return undefined;
    }

    const {
      startSwitch,
      durationSwitch,
      endDate,
      endTime,
      endUtc,
      startDate,
      startTime,
      startUtc,
      durationDays,
      durationHours,
      durationMinutes,
    } = values;

    const {
      days: minDays,
      hours: minHours,
      minutes: minMinutes,
    } = getDHMFromSeconds(
      (votingSettings as MajorityVotingSettings).minDuration
    );

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
      // Calculate the end date using duration
      const endDateTimeMill =
        startDateTime.valueOf() +
        offsetToMills({
          days: Number(durationDays),
          hours: Number(durationHours),
          minutes: Number(durationMinutes),
        });

      endDateTime = new Date(endDateTimeMill);

      // In case the endDate is close to being minimum durable, (and starting immediately)
      // to avoid passing late-date possibly, we just rely on SDK to set proper Date
      if (
        // If is Gasless, undefined is not allowed on vocdoni SDK election creation, and end date need to be specified
        // to be synced with the offchain proposal
        !isGaslessProposal &&
        endDateTime.valueOf() <= minEndDateTimeMills &&
        startSwitch === 'now'
      ) {
        /* Pass end date as undefined to SDK to auto-calculate min endDate */
        endDateTime = undefined;
      } else if (
        // In order to have a concordance between onchain and offchain endates, we add an offset to the end date to avoid
        // transaction fail due the end date is before the min end date
        isGaslessProposal &&
        endDateTime.valueOf() <= minEndDateTimeMills &&
        startSwitch === 'now'
      ) {
        const endDateOffset = 5; // Minutes
        endDateTime.setMinutes(endDateTime.getMinutes() + endDateOffset);
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

    const createProposalParams = {
      pluginAddress,
      metadataUri: `ipfs://${metadataCid}`,
      startDate: finalStartDate,
      endDate: endDateTime,
      actions,
    };

    return isGaslessProposal
      ? this.buildCreateGaslessProposalParams(createProposalParams)
      : createProposalParams;
  };

  private buildCreateGaslessProposalParams = (
    params: ICreateProposalParams
  ): GaslessProposalCreationParams => {
    // The offchain offset is used to ensure that the offchain proposal is enough long to don't overlap the onchain proposal
    // limits. As both chains don't use the same clock, and we are calculating the times using blocks, we ensure that
    // the times will be properly set to let the voters vote between the onchain proposal limits.
    const offchainOffsets = 1; // Minutes
    const gaslessEndDate = new Date(params.endDate!);
    gaslessEndDate.setMinutes(params.endDate!.getMinutes() + offchainOffsets);
    let gaslessStartDate;
    if (params.startDate) {
      gaslessStartDate = new Date(params.startDate);
      gaslessStartDate.setMinutes(
        params.startDate.getMinutes() - offchainOffsets
      );
    }

    return {
      ...params,
      // We ensure that the onchain endate is not undefined, during the calculation of the CreateMajorityVotingProposalParams
      endDate: params.endDate!,
      // Add offset to the end date to avoid onchain proposal finish before the offchain proposal
      gaslessEndDate,
      // Add offset to ensure offchain is started when proposal starts
      gaslessStartDate,
    };
  };
}

export const createProposalUtils = new CreateProposalUtils();
