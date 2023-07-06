import {AlertCard, ListItemAction} from '@aragon/ui-components';
import React from 'react';
import {useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {AccordionMethod, AccordionMethodType} from 'components/accordionMethod';
import {ComponentForType} from 'containers/smartContractComposer/components/inputForm';
import {useActionsContext} from 'context/actions';
import {useAlertContext} from 'context/alert';
import {ActionIndex, ActionWC, Input} from 'utils/types';

const WalletConnectAction: React.FC<ActionIndex & {allowRemove?: boolean}> = ({
  actionIndex,
  allowRemove = true,
}) => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();

  const [actionData] = useWatch({name: [`actions.${actionIndex}`]});
  const {removeAction} = useActionsContext();

  const methodActions = (() => {
    const result = [];

    if (allowRemove) {
      result.push({
        component: (
          <ListItemAction title={t('labels.removeEntireAction')} bgWhite />
        ),
        callback: () => {
          removeAction(actionIndex);
          alert(t('alert.chip.removedAction'));
        },
      });
    }

    return result;
  })();

  if (actionData) {
    return (
      <>
        <WalletConnectActionCard
          type="action-builder"
          action={actionData}
          actionIndex={actionIndex}
          methodActions={methodActions}
        />
      </>
    );
  }

  return null;
};

export default WalletConnectAction;

const InputName = styled.div.attrs({
  className: 'text-base font-bold text-ui-800 capitalize',
})``;

const Content = styled.div.attrs({
  className:
    'p-3 bg-ui-0 border border-ui-100 border-t-0 space-y-3 rounded-b-xl',
})``;

type WalletConnectActionCardProps = Pick<AccordionMethodType, 'type'> & {
  action: ActionWC;
  actionIndex?: number;
  methodActions?: Array<{
    component: React.ReactNode;
    callback: () => void;
  }>;
};

export const WalletConnectActionCard: React.FC<WalletConnectActionCardProps> =
  ({action, actionIndex, methodActions, type}) => {
    const {t} = useTranslation();

    return (
      <AccordionMethod
        type={type}
        methodName={action.functionName}
        dropdownItems={methodActions}
        smartContractName={action.contractName}
        verified={!!action.verified}
        methodDescription={action.notice}
      >
        <Content>
          {action.inputs?.length > 0 ? (
            <div className="pb-1.5 space-y-2">
              {(action.inputs as Input[]).map((input, index) => (
                <div key={input.name}>
                  <InputName>{input.name}</InputName>
                  <div className="mt-0.5 mb-1.5">
                    <span className="text-ui-600 ft-text-sm">
                      {input.notice}
                    </span>
                  </div>
                  <ComponentForType
                    disabled
                    key={input.name}
                    input={input}
                    formHandleName={`actions.${actionIndex}.inputs.${index}.value`}
                  />
                </div>
              ))}
            </div>
          ) : null}
          {!action.decoded && (
            <AlertCard
              title={t('newProposal.configureActions.actionAlertWarning.title')}
              helpText={t(
                'newProposal.configureActions.actionAlertWarning.desc'
              )}
              mode="warning"
            />
          )}
        </Content>
      </AccordionMethod>
    );
  };
