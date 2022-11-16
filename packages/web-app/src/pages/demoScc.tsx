import {ButtonText} from '@aragon/ui-components';
import {useNetwork} from 'context/network';
import React, {useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import styled from 'styled-components';
import {SccFormData} from 'utils/types';

import {TemporarySection} from 'components/temporary';
import ContractAddressValidation from 'containers/smartContractComposer/contractAddressValidation';
import SmartContractList from 'containers/smartContractComposer/contractListModal';
import EmptyState from 'containers/smartContractComposer/emptyStateModal/emptyState';

const defaultValues = {
  contractAddress: '',
};

const SCC: React.FC = () => {
  const [emptyStateIsOpen, setEmptyStateIsOpen] = React.useState(false);
  const [contractListIsOpen, setContractListIsOpen] = React.useState(false);

  const [addressValidationIsOpen, setAddressValidationIsOpen] =
    React.useState(false);
  const {setNetwork} = useNetwork();

  useEffect(() => {
    setNetwork('goerli');
  }, [setNetwork]);

  const methods = useForm<SccFormData>({mode: 'onChange', defaultValues});

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
            label="Show EmptyState"
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
