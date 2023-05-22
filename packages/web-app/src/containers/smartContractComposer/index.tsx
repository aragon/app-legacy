import {useNetwork} from 'context/network';
import React, {useEffect, useState} from 'react';
import {useFormContext, useWatch} from 'react-hook-form';

import ContractAddressValidation from 'containers/smartContractComposer/components/contractAddressValidation';
import SmartContractList from 'containers/smartContractComposer/contractListModal';
import EmptyState from 'containers/smartContractComposer/emptyStateModal/emptyState';
import {SmartContract, SmartContractAction} from 'utils/types';
import {getVerifiedSmartContracts} from 'services/cache';
import {useWallet} from 'hooks/useWallet';
import {CHAIN_METADATA} from 'utils/constants';
import {useActionsContext} from 'context/actions';

// TODO please move to types
export type SccFormData = {
  contractAddress: string;
  contracts: SmartContract[];
  selectedSC: SmartContract;
  selectedAction: SmartContractAction;
  ABIInput: string;
};

type SCC = {
  actionIndex: number;
};

const SCC: React.FC<SCC> = ({actionIndex}) => {
  const {address} = useWallet();

  const [emptyStateIsOpen, setEmptyStateIsOpen] = useState(true);
  const [contractListIsOpen, setContractListIsOpen] = useState(false);
  const [addressValidationIsOpen, setAddressValidationIsOpen] = useState(false);

  const {network} = useNetwork();
  const {setValue, resetField} = useFormContext();
  const connectedContracts = useWatch({name: 'contracts'});
  const {removeAction} = useActionsContext();

  useEffect(() => {
    if (address) {
      const storedContracts = getVerifiedSmartContracts(
        address,
        CHAIN_METADATA[network].id
      );

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setValue('contracts', storedContracts);
    }
  }, [address, network, setValue]);

  useEffect(() => {
    if (connectedContracts?.length > 0 && !addressValidationIsOpen) {
      setEmptyStateIsOpen(false);
      setContractListIsOpen(true);
    }
  }, [addressValidationIsOpen, connectedContracts?.length]);

  return (
    <>
      <SmartContractList
        actionIndex={actionIndex}
        isOpen={contractListIsOpen}
        onConnectNew={() => {
          setContractListIsOpen(false);
          setAddressValidationIsOpen(true);
        }}
        onClose={() => {
          setValue('selectedSC', null);
          setValue('selectedAction', null);
          setContractListIsOpen(false);
          resetField('sccActions');
          removeAction(actionIndex);
        }}
        onBackButtonClicked={() => {
          setValue('selectedSC', null);
          setValue('selectedAction', null);
          setContractListIsOpen(false);
          resetField('sccActions');
          removeAction(actionIndex);
        }}
        onComposeButtonClicked={() => {
          setContractListIsOpen(false);
          setValue('selectedSC', null);
          setValue('selectedAction', null);
        }}
        onRemoveContract={() => {
          setValue('selectedSC', null);
          setValue('selectedAction', null);
          setContractListIsOpen(false);
          resetField('sccActions');
          removeAction(actionIndex);
        }}
      />

      <EmptyState
        isOpen={emptyStateIsOpen}
        onConnectNew={() => {
          setEmptyStateIsOpen(false);
          setAddressValidationIsOpen(true);
        }}
        onClose={() => {
          setEmptyStateIsOpen(false);
          removeAction(actionIndex);
        }}
        onBackButtonClicked={() => {
          setEmptyStateIsOpen(false);
          removeAction(actionIndex);
        }}
      />

      <ContractAddressValidation
        isOpen={addressValidationIsOpen}
        onVerificationSuccess={() => {
          setAddressValidationIsOpen(false);
          setContractListIsOpen(true);
        }}
        onClose={() => {
          setAddressValidationIsOpen(false);
          removeAction(actionIndex);
        }}
        onBackButtonClicked={() => {
          setAddressValidationIsOpen(false);
          removeAction(actionIndex);
        }}
      />
    </>
  );
};

export default SCC;
