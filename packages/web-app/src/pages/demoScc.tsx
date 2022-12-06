import {ButtonText} from '@aragon/ui-components';
import {useNetwork} from 'context/network';
import React, {useEffect, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import styled from 'styled-components';

import {TemporarySection} from 'components/temporary';
import ContractAddressValidation from 'containers/smartContractComposer/components/contractAddressValidation';
import SmartContractList from 'containers/smartContractComposer/contractListModal';
import EmptyState from 'containers/smartContractComposer/emptyStateModal/emptyState';
import {SmartContract} from 'utils/types';

const defaultValues = {
  contracts: [],
  contractAddress: '',
};

// TODO please move to types
export type SccFormData = {
  contractAddress: string;
  contracts: Array<SmartContract>;
};

const SCC: React.FC = () => {
  const [emptyStateIsOpen, setEmptyStateIsOpen] = useState(false);
  const [contractListIsOpen, setContractListIsOpen] = useState(false);
  const [addressValidationIsOpen, setAddressValidationIsOpen] = useState(false);

  const methods = useForm<SccFormData>({mode: 'onChange', defaultValues});

  // TODO: temporary, to make sure we validate using goerli;
  // remove when integrating
  const {setNetwork} = useNetwork();
  useEffect(() => {
    setNetwork('goerli');
  }, [setNetwork]);

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
