import {ButtonText} from '@aragon/ui-components';
import {TemporarySection} from 'components/temporary';
import EmptyState from 'containers/smartContractComposer/emptyState';
import React from 'react';
import styled from 'styled-components';

const SCC: React.FC = () => {
  const [emptyStateIsOpen, setEmptyStateIsOpen] = React.useState(false);

  return (
    <Container>
      <TemporarySection purpose="SCC - Initial Modal, Empty State">
        <ButtonText
          label="Show EmptyState"
          onClick={() => setEmptyStateIsOpen(false)}
        />
        <EmptyState
          isOpen={emptyStateIsOpen}
          onClose={() => setEmptyStateIsOpen(false)}
          onBackButtonClicked={() => setEmptyStateIsOpen(false)}
        />
      </TemporarySection>
    </Container>
  );
};

export default SCC;

const Container = styled.div``;
