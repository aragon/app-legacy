import {ButtonText} from '@aragon/ui-components';
import {TemporarySection} from 'components/temporary';
import EmptyState from 'containers/smartContractComposer/emptyState';
import React from 'react';
import styled from 'styled-components';

const SCC: React.FC = () => {
  const [emptyStateIsOpen, setEmptyStateIsOpen] = React.useState(false);

  return (
    <Container>
      <TemporarySection purpose="SMART CONTRACT COMPOSER COMPONENTS" />

      <ButtonText
        label="Toggle EmptyState"
        onClick={() => setEmptyStateIsOpen(s => !s)}
      />
      <EmptyState
        isOpen={emptyStateIsOpen}
        onClose={() => setEmptyStateIsOpen(false)}
      />
    </Container>
  );
};

export default SCC;

const Container = styled.div``;
