import {useNetwork} from 'context/network';
import React, {useEffect, useState} from 'react';
import {FormProvider, useForm, useFormContext, useWatch} from 'react-hook-form';

import ContractAddressValidation from 'containers/smartContractComposer/components/contractAddressValidation';
import SmartContractList from 'containers/smartContractComposer/contractListModal';
import EmptyState from 'containers/smartContractComposer/emptyStateModal/emptyState';
import {SmartContract, SmartContractAction} from 'utils/types';
import {getVerifiedSmartContracts} from 'services/cache';
import {useWallet} from 'hooks/useWallet';
import {CHAIN_METADATA} from 'utils/constants';

const defaultValues = {
  contractAddress: '',
  contracts: [],
};

// TODO please move to types
export type SccFormData = {
  contractAddress: string;
  contracts: SmartContract[];
  selectedSC: SmartContract;
  selectedAction: SmartContractAction;
};

const SCC: React.FC = () => {
  const {address} = useWallet();

  const [emptyStateIsOpen, setEmptyStateIsOpen] = useState(false);
  const [contractListIsOpen, setContractListIsOpen] = useState(false);
  const [addressValidationIsOpen, setAddressValidationIsOpen] = useState(false);

  const {network} = useNetwork();
  const {setValue} = useFormContext();
  const connectedContracts = useWatch({name: 'contracts'});

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
    if (connectedContracts) {
      setContractListIsOpen(true);
    } else {
      setEmptyStateIsOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <SmartContractList
        isOpen={contractListIsOpen}
        onConnectNew={() => {
          setContractListIsOpen(false);
          setAddressValidationIsOpen(true);
        }}
        onClose={() => setContractListIsOpen(false)}
        onBackButtonClicked={() => setContractListIsOpen(false)}
      />

      <EmptyState
        isOpen={emptyStateIsOpen}
        onClose={() => setEmptyStateIsOpen(false)}
        onBackButtonClicked={() => setEmptyStateIsOpen(false)}
      />

      <ContractAddressValidation
        isOpen={addressValidationIsOpen}
        onVerificationSuccess={() => {
          setAddressValidationIsOpen(false);
          setContractListIsOpen(true);
        }}
        onClose={() => setAddressValidationIsOpen(false)}
        onBackButtonClicked={() => setAddressValidationIsOpen(false)}
      />
    </>
  );
};

const SCCProvider: React.FC = () => {
  const methods = useForm<SccFormData>({mode: 'onChange', defaultValues});
  return (
    <FormProvider {...methods}>
      <SCC />
    </FormProvider>
  );
};

export default SCCProvider;
