import {useNetwork} from 'context/network';
import React, {useEffect, useState} from 'react';
import {useFormContext, useWatch} from 'react-hook-form';

import ContractAddressValidation from 'containers/smartContractComposer/components/contractAddressValidation';
import SmartContractList from 'containers/smartContractComposer/contractListModal';
import EmptyState from 'containers/smartContractComposer/emptyStateModal/emptyState';
import {SmartContract, SmartContractAction} from 'utils/types';
import {
  getVerifiedSmartContracts,
  removeVerifiedSmartContract,
} from 'services/cache';
import {useWallet} from 'hooks/useWallet';
import {CHAIN_METADATA} from 'utils/constants';
import {useActionsContext} from 'context/actions';
import {useAlertContext} from 'context/alert';
import {useGlobalModalContext} from 'context/globalModals';

// TODO please move to types
export type SccFormData = {
  contractAddress: string;
  contracts: SmartContract[];
  selectedSC: SmartContract | null;
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
  const {setValue, getValues, resetField} = useFormContext();
  const connectedContracts = useWatch({name: 'contracts'});
  const {addAction, removeAction} = useActionsContext();
  const {alert} = useAlertContext();
  const {open} = useGlobalModalContext();

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
        onComposeButtonClicked={(another: boolean) => {
          if (!another) setContractListIsOpen(false);
          // CrowdIn needed
          if (another) {
            alert('Smart contract action added successfully');
            addAction({
              name: 'external_contract_modal',
            });
          }
          setValue('selectedSC', null);
          setValue('selectedAction', null);
        }}
        onRemoveContract={scAddress => {
          setValue('selectedSC', null);
          setValue('selectedAction', null);
          resetField('sccActions');
          removeVerifiedSmartContract(
            scAddress,
            address,
            CHAIN_METADATA[network].id
          );
          const currentContracts = getValues('contracts') as SmartContract[];
          const removeIdx = currentContracts.findIndex(
            ({address}) => address === scAddress
          );
          if (removeIdx !== -1) {
            currentContracts.splice(removeIdx, 1);
            setValue('contracts', currentContracts);
          }
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
