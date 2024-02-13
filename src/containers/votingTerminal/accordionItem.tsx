import React, {PropsWithChildren} from 'react';
import * as Accordion from '@radix-ui/react-accordion';

import styled from 'styled-components';
import {Button, AlertInline, IconType} from '@aragon/ods';

import {
  AccordionMethodType,
  AccordionType,
} from '../../components/accordionMethod';

type AccordionCustomHeaderType = Pick<
  AccordionMethodType,
  'methodName' | 'alertLabel'
> & {name: string} & PropsWithChildren;

export const VotingTerminalAccordionItem: React.FC<
  AccordionCustomHeaderType
> = ({name, methodName, alertLabel, children}) => (
  <Accordion.Item value={name}>
    <AccordionHeader>
      <HStack>
        <FlexContainer>
          <MethodName>{methodName}</MethodName>
          {alertLabel && <AlertInline message={alertLabel} variant="info" />}
        </FlexContainer>
        <Accordion.Trigger asChild>
          <AccordionButton
            variant="tertiary"
            size="md"
            iconLeft={IconType.CHEVRON_DOWN}
          />
        </Accordion.Trigger>
      </HStack>
    </AccordionHeader>
    <Accordion.Content>{children}</Accordion.Content>
  </Accordion.Item>
);

// Accordion styled components

const HStack = styled.div.attrs({
  className: 'flex justify-between space-x-6',
})``;

const MethodName = styled.p.attrs({
  className: 'font-semibold ft-text-lg text-neutral-800',
})``;

const FlexContainer = styled.div.attrs({
  className: 'md:flex flex-1 justify-between items-center space-y-1 ft-text-sm',
})``;

const AccordionHeader = styled(Accordion.Header).attrs(() => ({
  className: `p-4 md:px-6 border border-neutral-100 bg-neutral-0`,
}))<{type: AccordionType}>`
  &[data-state='open'] {
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    border-color: #e4e7eb;
  }
`;

const AccordionButton = styled(Button)`
  [data-state='open'] & {
    transform: rotate(180deg);
    background-color: #cbd2d9;
  }
`;
