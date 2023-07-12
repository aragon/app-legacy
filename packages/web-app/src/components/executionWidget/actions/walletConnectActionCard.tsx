import {AlertCard, Label} from '@aragon/ods';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {AccordionMethod, AccordionMethodType} from 'components/accordionMethod';
import {FormlessComponentForType} from 'containers/smartContractComposer/components/inputForm';
import {POTENTIALLY_TIME_SENSITIVE_FIELDS} from 'utils/constants/misc';
import {capitalizeFirstLetter, shortenAddress} from 'utils/library';
import {ActionWC, Input} from 'utils/types';

type WCActionCardActionCardProps = Pick<AccordionMethodType, 'type'> & {
  action: ActionWC;
  methodActions?: Array<{
    component: React.ReactNode;
    callback: () => void;
  }>;
};

export const WCActionCard: React.FC<WCActionCardActionCardProps> = ({
  action,
  methodActions,
  type,
}) => {
  const {t} = useTranslation();

  const showTimeSensitiveWarning = useMemo(() => {
    // Note: need to check whether the inputs exist because the decoding
    // and form setting might take a while
    if (action.inputs) {
      for (const i of action.inputs) {
        if (POTENTIALLY_TIME_SENSITIVE_FIELDS.has(i.name.toLowerCase()))
          return true;
      }
    }
    return false;
  }, [action.inputs]);

  return (
    <AccordionMethod
      type={type}
      methodName={action.functionName}
      dropdownItems={methodActions}
      smartContractName={shortenAddress(action.contractName)}
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
            title={t('newProposal.configureActions.actionAlertWarning.title')}
            helpText={t('newProposal.configureActions.actionAlertWarning.desc')}
            mode="warning"
          />
        )}
        {showTimeSensitiveWarning && (
          <AlertCard
            title={t('newProposal.configureActions.actionAlertCritical.title')}
            helpText={t(
              'newProposal.configureActions.actionAlertCritical.desc'
            )}
            mode="critical"
          />
        )}
      </Content>
    </AccordionMethod>
  );
};

type ContentProps = Pick<WCActionCardActionCardProps, 'type'>;

const Content = styled.div.attrs(({type}: ContentProps) => ({
  className: `px-2 desktop:px-3 p-3 border border-ui-100 border-t-0 space-y-2 desktop:space-y-3 rounded-b-xl ${
    type === 'action-builder' ? 'bg-ui-0' : 'bg-ui-50'
  }`,
}))<ContentProps>``;

const FormGroup = styled.div.attrs({
  className: 'space-y-2 desktop:space-y-3',
})``;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;
