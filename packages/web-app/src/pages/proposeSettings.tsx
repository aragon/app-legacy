import {useReactiveVar} from '@apollo/client';
import {
  ICreateProposalParams,
  InstalledPluginListItem,
  ProposalCreationSteps,
} from '@aragon/sdk-client';
import {IMetadata} from '@aragon/sdk-client/dist/internal/interfaces/client';
import {DaoAction} from '@aragon/sdk-client/dist/internal/interfaces/common';
import {IPluginSettings} from '@aragon/sdk-client/dist/internal/interfaces/plugins';
import {withTransaction} from '@elastic/apm-rum-react';
import Big from 'big.js';
import React, {useCallback, useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import {Loading} from 'components/temporary';
import CompareSettings from 'containers/compareSettings';
import DefineProposal from 'containers/defineProposal';
import ReviewProposal from 'containers/reviewProposal';
import SetupVotingForm from 'containers/setupVotingForm';
import PublishModal from 'containers/transactionModals/publishModal';
import {pendingProposalsVar} from 'context/apolloClient';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {usePrivacyContext} from 'context/privacyContext';
import {useSpecificProvider} from 'context/providers';
import {useClient} from 'hooks/useClient';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoParam} from 'hooks/useDaoParam';
import {useDaoToken} from 'hooks/useDaoToken';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import {usePluginSettings} from 'hooks/usePluginSettings';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useWallet} from 'hooks/useWallet';
import {
  CHAIN_METADATA,
  PENDING_PROPOSALS_KEY,
  TransactionState,
} from 'utils/constants';
import {getCanonicalUtcOffset, getSecondsFromDHM} from 'utils/date';
import {customJSONReplacer} from 'utils/library';
import {EditSettings, Proposal} from 'utils/paths';
import {mapToDetailedProposal} from 'utils/proposals';
import {getTokenInfo} from 'utils/tokens';

const ProposeSettings: React.FC = () => {
  const {t} = useTranslation();
  const {data: daoId} = useDaoParam();
  const {network} = useNetwork();
  const [showTxModal, setShowTxModal] = useState(false);

  const enableTxModal = () => {
    setShowTxModal(true);
  };

  return (
    <ProposeSettingWrapper
      showTxModal={showTxModal}
      setShowTxModal={setShowTxModal}
    >
      <FullScreenStepper
        wizardProcessName={t('newProposal.title')}
        navLabel={t('navLinks.settings')}
        returnPath={generatePath(EditSettings, {network, dao: daoId})}
      >
        <Step
          wizardTitle={t('settings.proposeSettings')}
          wizardDescription={t('settings.proposeSettingsSubtitle')}
        >
          <CompareSettings />
        </Step>
        <Step
          wizardTitle={t('newWithdraw.defineProposal.heading')}
          wizardDescription={t('newWithdraw.defineProposal.description')}
        >
          <DefineProposal />
        </Step>
        <Step
          wizardTitle={t('newWithdraw.setupVoting.title')}
          wizardDescription={t('newWithdraw.setupVoting.description')}
        >
          <SetupVotingForm />
        </Step>
        <Step
          wizardTitle={t('newWithdraw.reviewProposal.heading')}
          wizardDescription={t('newWithdraw.reviewProposal.description')}
          nextButtonLabel={t('labels.submitWithdraw')}
          onNextButtonClicked={enableTxModal}
          fullWidth
        >
          <ReviewProposal defineProposalStepNumber={2} />
        </Step>
      </FullScreenStepper>
    </ProposeSettingWrapper>
  );
};

export default withTransaction('ProposeSettings', 'component')(ProposeSettings);

type Props = {
  showTxModal: boolean;
  setShowTxModal: (value: boolean) => void;
};

const ProposeSettingWrapper: React.FC<Props> = ({
  showTxModal,
  setShowTxModal,
  children,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {preferences} = usePrivacyContext();

  const navigate = useNavigate();
  const {getValues} = useFormContext();

  const {network} = useNetwork();
  const {address, isOnWrongNetwork} = useWallet();
  const provider = useSpecificProvider(CHAIN_METADATA[network].id);

  const {data: dao, isLoading} = useDaoParam();
  const {data: daoDetails, isLoading: daoDetailsLoading} = useDaoDetails(dao);
  const {id: pluginType, instanceAddress: pluginAddress} =
    daoDetails?.plugins[0] || ({} as InstalledPluginListItem);

  const {
    data: {members},
  } = useDaoMembers(pluginAddress, pluginType as PluginTypes);

  const {data: pluginSettings} = usePluginSettings(
    pluginAddress,
    pluginType as PluginTypes
  );
  const {data: daoToken} = useDaoToken(pluginAddress);

  const {client} = useClient();
  const pluginClient = usePluginClient(pluginType as PluginTypes);

  const [proposalCreationData, setProposalCreationData] =
    useState<ICreateProposalParams>();

  const [creationProcessState, setCreationProcessState] =
    useState<TransactionState>(TransactionState.WAITING);

  // TODO: set proposal ID when sdk returns proper id for now dummy id
  const [proposalId] = useState<string>(
    '0xd7e937b8d779de644c691857e58e3342ab322345_0x0'
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tokenSupply, setTokenSupply] = useState<bigint>();
  const cachedProposals = useReactiveVar(pendingProposalsVar);

  const shouldPoll =
    creationProcessState === TransactionState.WAITING &&
    proposalCreationData !== undefined;

  /*************************************************
   *                     Effects                   *
   *************************************************/
  useEffect(() => {
    // Fetching necessary info about the token.
    async function fetchTotalSupply() {
      if (daoToken?.address)
        try {
          const {totalSupply} = await getTokenInfo(
            daoToken?.address,
            provider,
            CHAIN_METADATA[network].nativeCurrency
          );

          setTokenSupply(totalSupply);
        } catch (error) {
          console.error('Error fetching token information: ', error);
        }
    }

    fetchTotalSupply();
  }, [daoToken?.address, network, provider]);

  useEffect(() => {
    // encoding actions
    const encodeActions = async (): Promise<DaoAction[]> => {
      const [
        daoName,
        daoSummary,
        links,
        minimumParticipation,
        support,
        durationDays,
        durationHours,
        durationMinutes,
      ] = getValues([
        'daoName',
        'daoSummary',
        'links',
        'minimumParticipation',
        'support',
        'durationDays',
        'durationHours',
        'durationMinutes',
      ]);
      const actions: Array<Promise<DaoAction>> = [];

      // return an empty array for undefined clients
      if (!pluginClient || !client) return Promise.all(actions);

      const updateParams: IMetadata = {
        description: daoSummary,
        links: links,
        name: daoName,
        // avatar: avatarUrl,
      };
      actions.push(client.encoding.updateMetadataAction(dao, updateParams));

      const durationInSeconds = getSecondsFromDHM(
        durationDays,
        durationHours,
        durationMinutes
      );
      const settingsParams: IPluginSettings = {
        minDuration: durationInSeconds,
        minSupport: Big(support).div(100).toNumber(),
        minTurnout: Big(minimumParticipation).div(100).toNumber(),
      };
      actions.push(
        Promise.resolve(
          pluginClient.encoding.updatePluginSettingsAction(dao, settingsParams)
        )
      );
      return Promise.all(actions);
    };

    const getProposalCreationParams =
      async (): Promise<ICreateProposalParams> => {
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
        ]);

        const actions = await encodeActions();

        // Ignore encoding if the proposal had no actions
        return {
          pluginAddress,
          metadata: {
            title,
            summary,
            description,
            resources,
          },
          startDate: new Date(
            `${startDate}T${startTime}:00${getCanonicalUtcOffset(startUtc)}`
          ),
          endDate: new Date(
            `${endDate}T${endTime}:00${getCanonicalUtcOffset(endUtc)}`
          ),
          actions,
        };
      };

    async function setProposalData() {
      if (showTxModal && creationProcessState === TransactionState.WAITING)
        setProposalCreationData(await getProposalCreationParams());
    }

    setProposalData();
  }, [
    creationProcessState,
    showTxModal,
    getValues,
    dao,
    pluginAddress,
    pluginClient,
    client,
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

    return pluginClient?.estimation.createProposal(proposalCreationData);
  }, [pluginClient, proposalCreationData]);

  const {tokenPrice, maxFee, averageFee, stopPolling} = usePollGasFee(
    estimateCreationFees,
    shouldPoll
  );

  const handleCloseModal = () => {
    switch (creationProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        navigate(generatePath(Proposal, {network, dao, id: proposalId}));
        break;
      default: {
        setCreationProcessState(TransactionState.WAITING);
        setShowTxModal(false);
        stopPolling();
      }
    }
  };

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
    for await (const step of proposalIterator) {
      try {
        switch (step.key) {
          case ProposalCreationSteps.CREATING:
            console.log(step.txHash);
            break;
          case ProposalCreationSteps.DONE:
            console.log('proposal id', step.proposalId);
            // TODO: uncomment when sdk returns proper id
            // setProposalId(step.proposalId);
            setCreationProcessState(TransactionState.SUCCESS);

            // cache proposal
            // TODO: use step.proposalId when sdk returns proper id
            handleCacheProposal(proposalId);
            break;
        }
      } catch (error) {
        console.error(error);
        setCreationProcessState(TransactionState.ERROR);
      }
    }
  };

  const handleCacheProposal = useCallback(
    (newProposalId: string) => {
      if (!address || !daoDetails || !pluginSettings || !proposalCreationData)
        return;

      const proposalData = {
        creatorAddress: address,
        daoAddress: daoDetails?.address,
        daoName: daoDetails?.metadata.name,
        daoToken,
        totalVotingWeight:
          // TODO: use token supply once RPC issue is resolved
          pluginType === 'erc20voting.dao.eth'
            ? BigInt('500000000000000000000000000')
            : members.length,
        pluginSettings,
        proposalCreationData,
        proposalId: newProposalId,
      };

      const cachedProposal = mapToDetailedProposal(proposalData);
      const newCache = {
        ...cachedProposals,
        [newProposalId]: {...cachedProposal},
      };
      pendingProposalsVar(newCache);

      // persist new cache if functional cookies enabled
      if (preferences?.functional) {
        localStorage.setItem(
          PENDING_PROPOSALS_KEY,
          JSON.stringify(newCache, customJSONReplacer)
        );
      }
    },
    [
      address,
      cachedProposals,
      daoDetails,
      daoToken,
      members.length,
      pluginSettings,
      pluginType,
      preferences?.functional,
      proposalCreationData,
    ]
  );

  /*************************************************
   *                    Render                     *
   *************************************************/

  if (isLoading || daoDetailsLoading) {
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
        tokenPrice={tokenPrice}
        title={t('TransactionModal.createProposal')}
        buttonLabel={t('TransactionModal.createProposalNow')}
        buttonLabelSuccess={t('TransactionModal.launchGovernancePage')}
      />
    </>
  );
};
