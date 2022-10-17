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
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import {Loading} from 'components/temporary';
import CompareSettings from 'containers/compareSettings';
import DefineProposal from 'containers/defineProposal';
import ReviewProposal from 'containers/reviewProposal';
import SetupVotingForm from 'containers/setupVotingForm';
import PublishModal from 'containers/transactionModals/publishModal';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useClient} from 'hooks/useClient';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useWallet} from 'hooks/useWallet';
import {useFormContext} from 'react-hook-form';
import {TransactionState} from 'utils/constants';
import {getCanonicalUtcOffset, getSecondsFromDHM} from 'utils/date';
import {EditSettings, Governance} from 'utils/paths';

const ProposeSettings: React.FC = () => {
  const {t} = useTranslation();
  const {data: daoId, isLoading: daoParamLoading} = useDaoParam();
  const {network} = useNetwork();
  const [showTxModal, setShowTxModal] = useState(false);

  const enableTxModal = () => {
    setShowTxModal(true);
  };

  if (daoParamLoading) {
    return <Loading />;
  }

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
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {getValues} = useFormContext();
  const {t} = useTranslation();
  const {isOnWrongNetwork} = useWallet();
  const {open} = useGlobalModalContext();
  const {data: dao, isLoading} = useDaoParam();
  const {data: daoDetails, isLoading: daoDetailsLoading} = useDaoDetails(dao);
  const {client} = useClient();
  const [proposalCreationData, setProposalCreationData] =
    useState<ICreateProposalParams>();

  const {id: pluginType, instanceAddress: pluginAddress} =
    daoDetails?.plugins[0] || ({} as InstalledPluginListItem);

  const pluginClient = usePluginClient(pluginType as PluginTypes);

  const [creationProcessState, setCreationProcessState] =
    useState<TransactionState>(TransactionState.WAITING);

  const shouldPoll =
    creationProcessState === TransactionState.WAITING &&
    proposalCreationData !== undefined;

  useEffect(() => {
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
        navigate(generatePath(Governance, {network, dao}));
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
            setCreationProcessState(TransactionState.SUCCESS);
            break;
        }
      } catch (error) {
        console.error(error);
        setCreationProcessState(TransactionState.ERROR);
      }
    }
  };

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
