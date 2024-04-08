import {ModalProps} from '@aragon/ods-old';
import {TransactionDialog} from 'containers/transactionDialog';
import React, {useState} from 'react';
import {CreateProposalDialogSteps} from './createProposalDialogSteps';
import {useTranslation} from 'react-i18next';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {
  GaslessPluginName,
  PluginTypes,
  usePluginClient,
} from 'hooks/usePluginClient';
import {createProposalUtils} from './utils';
import {useFormContext} from 'react-hook-form';
import {
  CreateProposalFormData,
  GaslessProposalCreationParams,
} from 'utils/types';
import {useVotingSettings} from 'services/aragon-sdk/queries/use-voting-settings';
import {useEncodeActions} from 'services/actionEncoder/queries/useEncodeActions';
import {useClient} from 'hooks/useClient';
import {useNetwork} from 'context/network';
import {
  useCreateProposalTransaction,
  useSendCreateProposalTransaction,
} from './hooks';
import {generatePath, useNavigate} from 'react-router-dom';
import {Proposal} from 'utils/paths';
import {toDisplayEns} from 'utils/library';
import {CreateProposalDialogGaslessSteps} from './createProposalDialogGaslessSteps';
import {useCreateVocdoniProposalTransaction} from './hooks/useCreateVocdoniProposalTransaction';
import {ICreateProposalParams} from './utils/createProposalUtils';

export interface ICreateProposalDialogProps extends ModalProps {}

const createProposalProcess = 'CREATE_PROPOSAL';
const createGaslessProposalProcess = 'CREATE_GASLESS_PROPOSAL';

export const CreateProposalDialog: React.FC<
  ICreateProposalDialogProps
> = props => {
  const {isOpen, onClose, ...otherProps} = props;

  const {t} = useTranslation();
  const {client} = useClient();
  const {network} = useNetwork();
  const navigate = useNavigate();

  const {getValues} = useFormContext();
  const formValues = getValues();
  const {actions} = formValues;

  const {data: daoDetails} = useDaoDetailsQuery();
  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as
    | string
    | undefined;
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes | undefined;
  const isGaslessProposal = pluginType === GaslessPluginName;

  const pluginClient = usePluginClient(pluginType);
  const {data: votingSettings} = useVotingSettings({pluginAddress, pluginType});

  const [metadataCid, setMetadataCid] = useState<string>();

  const {data: encodedActions} = useEncodeActions({
    actions,
    network,
    pluginClient,
    votingSettings,
    client,
    pluginAddress,
    t,
    daoAddress: daoDetails?.address,
  });

  const createProposalParams = createProposalUtils.buildCreateProposalParams({
    values: formValues as CreateProposalFormData,
    isGaslessProposal,
    actions: encodedActions,
    votingSettings,
    metadataCid,
    pluginAddress,
  });

  const {transaction, isLoading: isTransactionLoading} =
    useCreateProposalTransaction({
      createProposalParams: createProposalParams as
        | ICreateProposalParams
        | undefined,
      pluginType,
    });

  const createGaslessTransactionResult = useCreateVocdoniProposalTransaction({
    initializeProcess: isOpen,
    createProposalParams: createProposalParams as
      | GaslessProposalCreationParams
      | undefined,
    pluginType,
    pluginAddress,
    logContext: {stack: [createGaslessProposalProcess], data: formValues},
  });

  const sendTransactionResults = useSendCreateProposalTransaction({
    process: createProposalProcess,
    transaction: transaction ?? createGaslessTransactionResult.transaction,
    votingSettings,
  });

  const onSuccessButtonClick = () => {
    if (!sendTransactionResults.txReceipt || !pluginType || !pluginAddress) {
      return;
    }

    const proposalId = createProposalUtils.getProposalIdFromReceipt(
      sendTransactionResults.txReceipt,
      pluginType,
      pluginAddress
    )!;

    const proposalPathParams = {
      network,
      dao: toDisplayEns(daoDetails?.ensDomain) || daoDetails?.address,
      id: proposalId,
    };
    const proposalPath = generatePath(Proposal, proposalPathParams);
    navigate(proposalPath);
    onClose?.();
  };

  return (
    <TransactionDialog
      title={t('createProposalDialog.title')}
      isOpen={isOpen}
      sendTransactionResult={sendTransactionResults}
      displayTransactionStatus={transaction != null}
      sendTransactionLabel={t('createProposalDialog.button.approve')}
      successButton={{
        label: t('createProposalDialog.button.success'),
        onClick: onSuccessButtonClick,
      }}
      onClose={onClose}
      {...otherProps}
    >
      {!isGaslessProposal ? (
        <CreateProposalDialogSteps
          process={createProposalProcess}
          isLoading={isTransactionLoading}
          onPinProposalMetadataSuccess={setMetadataCid}
          pinMetadata={isOpen}
        />
      ) : (
        <CreateProposalDialogGaslessSteps
          process={createProposalProcess}
          createTransactionResult={createGaslessTransactionResult}
        />
      )}
    </TransactionDialog>
  );
};
