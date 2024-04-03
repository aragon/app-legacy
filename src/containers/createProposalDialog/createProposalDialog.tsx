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
import {CreateProposalFormData} from 'utils/types';
import {useVotingSettings} from 'services/aragon-sdk/queries/use-voting-settings';
import {useEncodeActions} from 'services/actionEncoder/queries/useEncodeActions';
import {useClient} from 'hooks/useClient';
import {useNetwork} from 'context/network';
import {useCreateProposalTransaction} from './hooks/useCreateProposalTransaction';

export interface ICreateProposalDialogProps extends ModalProps {}

const createProposalProcess = 'CREATE_PROPOSAL';

export const CreateProposalDialog: React.FC<
  ICreateProposalDialogProps
> = props => {
  const {isOpen, onClose, ...otherProps} = props;

  const {t} = useTranslation();
  const {client} = useClient();
  const {network} = useNetwork();

  const {getValues} = useFormContext();
  const formValues = getValues() as CreateProposalFormData;
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
    values: formValues,
    isGaslessProposal,
    actions: encodedActions,
    votingSettings,
    metadataCid,
    pluginAddress,
  });

  const {transaction, isLoading: isTransactionLoading} =
    useCreateProposalTransaction({createProposalParams});

  const onSuccessButtonClick = () => {
    // TODO: handle success
  };

  return (
    <TransactionDialog
      title={t('createProposalDialog.title')}
      isOpen={isOpen}
      sendTransactionResult={sendTransactionResults}
      displayTransactionStatus={transaction != null}
      sendTransactionLabel="Deploy DAO now"
      successButton={{
        label: 'Launch DAO Dashboard',
        onClick: onSuccessButtonClick,
      }}
      onClose={onClose}
      {...otherProps}
    >
      <CreateProposalDialogSteps
        process={createProposalProcess}
        isLoading={isTransactionLoading}
        onPinProposalMetadataSuccess={setMetadataCid}
        pinMetadata={isOpen}
      />
    </TransactionDialog>
  );
};
