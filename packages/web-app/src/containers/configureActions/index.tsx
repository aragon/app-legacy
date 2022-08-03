import React from 'react';
import {
  AlertInline,
  ButtonText,
  IconAdd,
  Label,
  StateEmpty,
} from '@aragon/ui-components';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {StringIndexed} from 'utils/types';
import {useGlobalModalContext} from 'context/globalModals';
import {useActionsContext} from 'context/actions';
import ActionBuilder from 'containers/actionBuilder';

const ConfigureActions: React.FC = () => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {actions} = useActionsContext();

  return (
    <>
      <FormItem>
        <Label
          label={t('newProposal.configureActions.yesOption')}
          helpText={t('newProposal.configureActions.yesOptionSubtitle')}
          isOptional
        />
        {actions.length !== 0 ? (
          <ActionsWrapper>
            <ActionBuilder />
            <ButtonText
              mode="ghost"
              size="large"
              bgWhite
              label={t('newProposal.configureActions.addAction')}
              iconLeft={<IconAdd />}
              onClick={() => open('addAction')}
              className="mt-2 w-full tablet:w-max"
            />
          </ActionsWrapper>
        ) : (
          <>
            <StateEmpty
              type="Object"
              mode="card"
              object="smart_contract"
              title={t('newProposal.configureActions.addFirstAction')}
              description={t(
                'newProposal.configureActions.addFirstActionSubtitle'
              )}
              secondaryButton={{
                label: t('newProposal.configureActions.addAction'),
                onClick: () => open('addAction'),
              }}
            />
            <AlertInline
              label={t('newProposal.configureActions.actionsInfo')}
            />
          </>
        )}
      </FormItem>
    </>
  );
};

export default ConfigureActions;

/**
 * Check if the screen is valid
 * @param errors List of fields with errors
 * @returns Whether the screen is valid
 */
export function isValid(errors: StringIndexed) {
  return !errors.actions;
}

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const ActionsWrapper = styled.div.attrs({
  className: 'space-y-2',
})``;
