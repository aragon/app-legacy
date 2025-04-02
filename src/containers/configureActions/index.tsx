import React, {useEffect, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import styled from 'styled-components';
import {Label} from '@aragon/ods-old';
import {Button, AlertInline, IconType, CardEmptyState} from '@aragon/ods';
import ActionBuilder from 'containers/actionBuilder';
import AddActionMenu from 'containers/addActionMenu';
import {useActionsContext} from 'context/actions';
import {useGlobalModalContext} from 'context/globalModals';
import {useDaoActions} from 'hooks/useDaoActions';
import {i18n} from '../../../i18n.config';
import {ActionsTypes} from 'utils/types';

interface ConfigureActionsProps {
  label?: string;
  initialActions?: ActionsTypes[];
  whitelistedActions?: ActionsTypes[];
  hideAlert?: boolean;
  addNewActionLabel?: string;
  onAddNewActionClick?: () => void;
  addExtraActionLabel?: string;
  onAddExtraActionClick?: () => void;
  allowEmpty?: boolean;
}

const ConfigureActions: React.FC<ConfigureActionsProps> = ({
  label = i18n.t('newProposal.configureActions.yesOption') || '',
  initialActions = [],
  whitelistedActions,
  hideAlert = false,
  addNewActionLabel = i18n.t('newProposal.configureActions.addAction') || '',
  onAddNewActionClick,
  addExtraActionLabel = i18n.t('newProposal.configureActions.addAction') || '',
  onAddExtraActionClick,
  allowEmpty = true,
}) => {
  const {dao: daoAddressOrEns} = useParams();
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {actions, addAction} = useActionsContext();
  const {data: possibleActions} = useDaoActions(daoAddressOrEns ?? '');

  const allowedActions = useMemo(() => {
    if (!whitelistedActions) return possibleActions;
    return possibleActions.filter(actionItem =>
      whitelistedActions.includes(actionItem.type)
    );
  }, [possibleActions, whitelistedActions]);

  /**
   * Here we are adding initial actions in case they are not already in place.
   */
  useEffect(() => {
    const existentActions = actions.map(actionItem => actionItem.name);

    initialActions.forEach(actionType => {
      if (!existentActions.includes(actionType)) {
        addAction({name: actionType}, false);
      }
    });
  }, [actions, addAction, initialActions]);

  const handleAddNewActionClick = () => {
    if (onAddNewActionClick) {
      onAddNewActionClick();
    } else {
      open('addAction');
    }
  };

  const handleExtraActionClick = () => {
    if (onAddExtraActionClick) {
      onAddExtraActionClick();
    } else {
      open('addAction');
    }
  };

  return (
    <FormWrapper>
      {label && <Label label={label} isOptional />}
      {actions.length ? (
        <ActionsWrapper>
          <ActionBuilder allowEmpty={allowEmpty} />
          <Button
            variant="tertiary"
            size="lg"
            iconLeft={IconType.PLUS}
            onClick={handleExtraActionClick}
            className="mt-4 w-full md:w-max"
          >
            {addExtraActionLabel}
          </Button>
        </ActionsWrapper>
      ) : (
        <>
          <CardEmptyState
            objectIllustration={{object: 'SMART_CONTRACT'}}
            heading={t('newProposal.configureActions.addFirstAction')}
            description={t(
              'newProposal.configureActions.addFirstActionSubtitle'
            )}
            secondaryButton={{
              label: addNewActionLabel,
              onClick: handleAddNewActionClick,
              iconLeft: IconType.PLUS,
            }}
          />
          {!hideAlert && (
            <AlertInline
              message={t('newProposal.configureActions.actionsInfo')}
              variant="info"
            />
          )}
        </>
      )}
      <AddActionMenu actions={allowedActions} />
    </FormWrapper>
  );
};

export default ConfigureActions;

const FormWrapper = styled.div.attrs({
  className: 'space-y-3',
})``;

const ActionsWrapper = styled.div.attrs({
  className: 'space-y-4',
})``;
