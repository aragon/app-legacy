import {AlertInline, ButtonText, IconAdd, Label} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {StateEmpty} from 'components/stateEmpty';
import ActionBuilder from 'containers/actionBuilder';
import AddActionMenu from 'containers/addActionMenu';
import {useActionsContext} from 'context/actions';
import {useGlobalModalContext} from 'context/globalModals';
import {useDaoActions} from 'hooks/useDaoActions';
import {useDaoParam} from 'hooks/useDaoParam';

const ConfigureActions: React.FC = () => {
  const {data: daoId} = useDaoParam();
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {actions} = useActionsContext();
  const {data: availableActions} = useDaoActions(daoId);

  return (
    <FormWrapper>
      <Label
        label={t('newProposal.configureActions.yesOption')}
        helpText={t('newProposal.configureActions.yesOptionSubtitle')}
        isOptional
      />
      {actions.length ? (
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
              iconLeft: <IconAdd />,
            }}
          />
          <AlertInline label={t('newProposal.configureActions.actionsInfo')} />
        </>
      )}
      <AddActionMenu actions={availableActions} />
    </FormWrapper>
  );
};

export default ConfigureActions;

const FormWrapper = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const ActionsWrapper = styled.div.attrs({
  className: 'space-y-2',
})``;
