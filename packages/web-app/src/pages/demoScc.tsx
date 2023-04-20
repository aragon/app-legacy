import {ButtonText} from '@aragon/ui-components';
import {useNetwork} from 'context/network';
import React, {useEffect, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import styled from 'styled-components';

import {TemporarySection} from 'components/temporary';
import ContractAddressValidation from 'containers/smartContractComposer/components/contractAddressValidation';
import SmartContractList from 'containers/smartContractComposer/contractListModal';
import EmptyState from 'containers/smartContractComposer/emptyStateModal/emptyState';
import {useWallet} from 'hooks/useWallet';
import {getVerifiedSmartContracts} from 'services/cache';
import {CHAIN_METADATA} from 'utils/constants';
import {SmartContract} from 'utils/types';

const defaultValues = {
  contractAddress: '',
  contracts: [],
};

// TODO please move to types
export type SccFormData = {
  contractAddress: string;
  contracts: SmartContract[];
  selectedSC: SmartContract;
};

const SCC: React.FC = () => {
  const {address} = useWallet();

  const [emptyStateIsOpen, setEmptyStateIsOpen] = useState(false);
  const [contractListIsOpen, setContractListIsOpen] = useState(false);
  const [addressValidationIsOpen, setAddressValidationIsOpen] = useState(false);

  const methods = useForm<SccFormData>({mode: 'onChange', defaultValues});

  // TODO: temporary, to make sure we validate using goerli;
  // remove when integrating
  const {setNetwork, network} = useNetwork();
  useEffect(() => {
    setNetwork('goerli');
  }, [setNetwork]);

  useEffect(() => {
    if (address) {
      const storedContracts = getVerifiedSmartContracts(
        address,
        CHAIN_METADATA[network].id
      );

      methods.setValue('contracts', storedContracts);
    }
  }, [address, methods, network]);

  return (
    <FormProvider {...methods}>
      <Container>
        <TemporarySection purpose="SCC - Initial Modal, Empty State">
          <ButtonText
            label="Show EmptyState"
            onClick={() => setEmptyStateIsOpen(true)}
          />
          <EmptyState
            isOpen={emptyStateIsOpen}
            onClose={() => setEmptyStateIsOpen(false)}
            onBackButtonClicked={() => setEmptyStateIsOpen(false)}
          />
        </TemporarySection>
        <TemporarySection purpose="SCC - Contract Address Validation">
          <ButtonText
            label="Show Address Validation"
            onClick={() => setAddressValidationIsOpen(true)}
          />
          <ContractAddressValidation
            isOpen={addressValidationIsOpen}
            onClose={() => setAddressValidationIsOpen(false)}
            onBackButtonClicked={() => setAddressValidationIsOpen(false)}
          />
        </TemporarySection>

        <TemporarySection purpose="SCC - Initial Modal, Connected Contracts">
          <ButtonText
            label="Show list of contracts"
            onClick={() => setContractListIsOpen(true)}
          />
          <SmartContractList
            isOpen={contractListIsOpen}
            onConnect={() => {}}
            onClose={() => setContractListIsOpen(false)}
            onBackButtonClicked={() => setContractListIsOpen(false)}
          />
        </TemporarySection>
      </Container>
    </FormProvider>
  );
};

export default SCC;

const Container = styled.div``;
