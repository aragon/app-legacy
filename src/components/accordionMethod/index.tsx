import React, {ReactNode} from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import {
  AlertInline,
  ButtonIcon,
  IconChevronDown,
  IconMenuVertical,
  IconSuccess,
  IconWarning,
  Dropdown,
  ListItemProps,
} from '@aragon/ods-old';
import styled from 'styled-components';

export type AccordionType = 'action-builder' | 'execution-widget';

export type AccordionMethodType = {
  type: AccordionType;
  methodName: string;
  smartContractName?: string;
  verified?: boolean;
  alertLabel?: string;
  methodDescription?: string | React.ReactNode;
  additionalInfo?: string;
  dropdownItems?: ListItemProps[];
  customHeader?: React.ReactNode;
  children: ReactNode;
};

export const AccordionMethod: React.FC<AccordionMethodType> = ({
  children,
  ...props
}) => (
  <Accordion.Root type="single" collapsible defaultValue="item-1">
    <AccordionItem name="item-1" {...props}>
      {children}
    </AccordionItem>
  </Accordion.Root>
);

export const AccordionMultiple: React.FC<{
  defaultValue: string;
  className?: string;
  children: ReactNode;
}> = ({defaultValue, className, children}) => (
  <Accordion.Root
    type="single"
    defaultValue={defaultValue}
    collapsible
    className={className}
  >
    {children}
  </Accordion.Root>
);

export const AccordionItem: React.FC<AccordionMethodType & {name: string}> = ({
  type,
  name,
  methodName,
  smartContractName,
  verified = false,
  alertLabel,
  methodDescription,
  additionalInfo,
  dropdownItems = [],
  customHeader,
  children,
}) => (
  <Accordion.Item value={name}>
    {!customHeader ? (
      <AccordionHeader type={type}>
        <HStack>
          <FlexContainer>
            <MethodName>{methodName}</MethodName>
            {smartContractName && (
              <div
                className={`flex items-center space-x-1 ${
                  verified ? 'text-primary-600' : 'text-warning-600'
                }`}
              >
                <p
                  className={`font-semibold ${
                    verified ? 'text-primary-500' : 'text-warning-500'
                  }`}
                >
                  {smartContractName}
                </p>
                {verified ? <IconSuccess /> : <IconWarning />}
              </div>
            )}
            {alertLabel && <AlertInline label={alertLabel} />}
          </FlexContainer>

          <VStack>
            {type === 'action-builder' && (
              <Dropdown
                side="bottom"
                align="end"
                listItems={dropdownItems}
                disabled={dropdownItems.length === 0}
                trigger={
                  <ButtonIcon
                    mode="ghost"
                    size="medium"
                    icon={<IconMenuVertical />}
                  />
                }
              />
            )}
            <Accordion.Trigger asChild>
              <AccordionButton
                mode={type === 'action-builder' ? 'ghost' : 'secondary'}
                size="medium"
                icon={<IconChevronDown />}
              />
            </Accordion.Trigger>
          </VStack>
        </HStack>

        {methodDescription && (
          <AdditionalInfoContainer>
            <p className="md:pr-20">{methodDescription}</p>

            {additionalInfo && (
              <AlertInline label={additionalInfo} mode="neutral" />
            )}
          </AdditionalInfoContainer>
        )}
      </AccordionHeader>
    ) : (
      <>{customHeader}</>
    )}

    <Accordion.Content>{children}</Accordion.Content>
  </Accordion.Item>
);

const AccordionHeader = styled(Accordion.Header).attrs<{type: AccordionType}>(
  ({type}) => ({
    className: `p-4 md:px-6 rounded-xl border border-neutral-100 ${
      type === 'action-builder' ? 'bg-neutral-0' : 'bg-neutral-50'
    }`,
  })
)<{type: AccordionType}>`
  &[data-state='open'] {
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    border-color: #e4e7eb;
  }
`;

const AccordionButton = styled(ButtonIcon)`
  [data-state='open'] & {
    transform: rotate(180deg);
    background-color: #cbd2d9;
  }
`;

const AdditionalInfoContainer = styled.div.attrs({
  className: 'mt-1.5 ft-text-sm text-neutral-600 space-y-1.5',
})`
  [data-state='closed'] & {
    display: none;
  }
`;

const FlexContainer = styled.div.attrs({
  className:
    'md:flex flex-1 justify-between items-center space-y-0.5 ft-text-sm',
})``;

const MethodName = styled.p.attrs({
  className: 'font-semibold ft-text-lg text-neutral-800',
})``;

const HStack = styled.div.attrs({
  className: 'flex justify-between space-x-6',
})``;

const VStack = styled.div.attrs({
  className: 'flex items-start space-x-1',
})``;
