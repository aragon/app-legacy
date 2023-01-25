import React from 'react';
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
} from '@aragon/ui-components';
import styled from 'styled-components';

export type AccordionMethodType = {
  type: 'action-builder' | 'execution-widget';
  methodName: string;
  smartContractName?: string;
  verified?: boolean;
  alertLabel?: string;
  methodDescription?: string | React.ReactNode;
  additionalInfo?: string;
  dropdownItems?: ListItemProps[];
  customHeader?: React.ReactNode;
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
                  className={`font-bold ${
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
            <p className="tablet:pr-10">{methodDescription}</p>

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

export type AccordionType = Pick<AccordionMethodType, 'type'>;

const AccordionHeader = styled(Accordion.Header).attrs(
  ({type}: AccordionType) => ({
    className: `p-2 tablet:px-3 rounded-xl border border-ui-100 ${
      type === 'action-builder' ? 'bg-white' : 'bg-ui-50'
    }`,
  })
)<AccordionType>`
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
  className: 'mt-1.5 ft-text-sm text-ui-600 space-y-1.5',
})`
  [data-state='closed'] & {
    display: none;
  }
`;

const FlexContainer = styled.div.attrs({
  className:
    'tablet:flex flex-1 justify-between items-center space-y-0.5 ft-text-sm',
})``;

const MethodName = styled.p.attrs({
  className: 'font-bold ft-text-lg text-ui-800',
})``;

const HStack = styled.div.attrs({
  className: 'flex justify-between space-x-3',
})``;

const VStack = styled.div.attrs({
  className: 'flex items-start space-x-1',
})``;
