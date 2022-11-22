import {ButtonText} from '@aragon/ui-components';
import {TemporarySection} from 'components/temporary';
import ContractAddressValidation from 'containers/smartContractComposer/contractAddressValidation';
import EmptyState from 'containers/smartContractComposer/emptyState';
import React from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import styled from 'styled-components';

const SCC: React.FC = () => {
  const [emptyStateIsOpen, setEmptyStateIsOpen] = React.useState(false);
  const [addressValidationIsOpen, setAddressValidationIsOpen] =
    React.useState(false);

  const methods = useForm({mode: 'onChange'});

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
      </Container>
    </FormProvider>
  );
};

export default SCC;

const Container = styled.div``;
