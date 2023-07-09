import {AlertCard} from '@aragon/ui-components';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {AccordionMethod, AccordionMethodType} from 'components/accordionMethod';
import {FormlessComponentForType} from 'containers/smartContractComposer/components/inputForm';
import {POTENTIALLY_TIME_SENSITIVE_FIELDS} from 'utils/constants/misc';
import {shortenAddress} from 'utils/library';
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
    for (const i of action.inputs) {
      if (POTENTIALLY_TIME_SENSITIVE_FIELDS.has(i.name.toLowerCase()))
        return true;
    }
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
          <div className="pb-1.5 space-y-2">
            {(action.inputs as Input[]).map(input => (
              <div key={input.name}>
                <InputName>{input.name}</InputName>
                <div className="mt-0.5 mb-1.5">
                  <span className="text-ui-600 ft-text-sm">{input.notice}</span>
                </div>
                <FormlessComponentForType
                  disabled
                  key={input.name}
                  input={input}
                />
              </div>
            ))}
          </div>
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
  className: `p-3 border border-ui-100 border-t-0 space-y-3 rounded-b-xl ${
    type === 'action-builder' ? 'bg-ui-0' : 'bg-ui-50'
  }`,
}))<ContentProps>``;

const InputName = styled.div.attrs({
  className: 'text-base font-bold text-ui-800 capitalize',
})``;
