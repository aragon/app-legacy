import {Label} from '@aragon/ods-old';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {AlertCard} from '@aragon/ods';

import {AccordionMethod, AccordionMethodType} from 'components/accordionMethod';
import {FormlessComponentForType} from 'containers/smartContractComposer/components/inputForm';
import {POTENTIALLY_TIME_SENSITIVE_FIELDS} from 'utils/constants/misc';
import {capitalizeFirstLetter, shortenAddress} from 'utils/library';
import {ActionWC, ExecutionStatus, Input} from 'utils/types';
import {CHAIN_METADATA} from 'utils/constants';
import {useNetwork} from 'context/network';

type WCActionCardActionCardProps = Pick<AccordionMethodType, 'type'> & {
  action: ActionWC;
  methodActions?: React.ReactNode[];
  status: ExecutionStatus | undefined;
};

export const WCActionCard: React.FC<WCActionCardActionCardProps> = ({
  action,
  methodActions,
  status,
  type,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  const showTimeSensitiveWarning = useMemo(() => {
    // Note: need to check whether the inputs exist because the decoding
    // and form setting might take a while
    if (action.inputs) {
      for (const input of action.inputs) {
        if (POTENTIALLY_TIME_SENSITIVE_FIELDS.has(input.name.toLowerCase())) {
          return true;
        }

        // for tuples
        if (input.type === 'tuple' && Array.isArray(input.value)) {
          // for whatever reason the name is coming as the array index??
          for (const name in input.value as {}) {
            if (POTENTIALLY_TIME_SENSITIVE_FIELDS.has(name.toLowerCase())) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }, [action.inputs]);

  return (
    <AccordionMethod
      type={type}
      methodName={action.functionName}
      dropdownItems={methodActions}
      smartContractName={action.contractName}
      smartContractAddress={shortenAddress(action.contractAddress)}
      blockExplorerLink={
        action.contractAddress
          ? `${CHAIN_METADATA[network].explorer}address/${action.contractAddress}`
          : undefined
      }
      verified={!!action.verified}
      methodDescription={action.notice}
    >
      <Content type={type}>
        {action.inputs?.length > 0 ? (
          <FormGroup>
            {action.inputs.map(input => {
              if (!input.name) return null;
              return (
                <FormItem key={input.name}>
                  <Label
                    label={capitalizeFirstLetter(input.name)}
                    helpText={input.notice}
                  />
                  <FormlessComponentForType
                    disabled
                    key={input.name}
                    input={input as Input}
                  />
                </FormItem>
              );
            })}
          </FormGroup>
        ) : null}
        {!action.decoded && (
          <AlertCard
            variant="warning"
            message={t('newProposal.configureActions.actionAlertWarning.title')}
            description={t(
              'newProposal.configureActions.actionAlertWarning.desc'
            )}
          />
        )}
        {status !== 'executed' && showTimeSensitiveWarning && (
          <AlertCard
            variant="critical"
            message={t(
              'newProposal.configureActions.actionAlertCritical.title'
            )}
            description={t(
              'newProposal.configureActions.actionAlertCritical.desc'
            )}
          />
        )}
      </Content>
    </AccordionMethod>
  );
};

const Content = styled.div.attrs<{type: WCActionCardActionCardProps['type']}>(
  ({type}) => ({
    className: `px-4 xl:px-6 p-6 border border-neutral-100 border-t-0 space-y-4 xl:space-y-6 rounded-b-xl ${
      type === 'action-builder' ? 'bg-neutral-0' : 'bg-neutral-50'
    }`,
  })
)<{type: WCActionCardActionCardProps['type']}>``;

const FormGroup = styled.div.attrs({
  className: 'space-y-4 xl:space-y-6',
})``;

const FormItem = styled.div.attrs({
  className: 'space-y-3',
})``;
