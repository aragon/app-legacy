import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {ListItemAction} from '@aragon/ods-old';
import {Icon, IconType} from '@aragon/ods';

import {useGlobalModalContext} from 'context/globalModals';
import {useActionsContext} from 'context/actions';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {ActionParameter, ActionsTypes} from 'utils/types';
import {trackEvent} from 'services/analytics';
import {useParams} from 'react-router-dom';

type AddActionMenuProps = {
  actions: ActionParameter[];
};

const AddActionMenu: React.FC<AddActionMenuProps> = ({actions}) => {
  const {dao: daoAddressOrEns} = useParams();
  const {isOpen, close} = useGlobalModalContext('addAction');
  const {actions: usedActions, addAction} = useActionsContext();
  const {t} = useTranslation();

  const handleActionClick = (actionType: ActionsTypes) => {
    trackEvent('newProposal_action_selected', {
      dao_address: daoAddressOrEns,
      action: actionType,
    });

    addAction({name: actionType});
    close();
  };

  return (
    <ModalBottomSheetSwitcher
      isOpen={isOpen}
      onClose={close}
      title={t('AddActionModal.title')}
    >
      <Container>
        {actions.map(a => (
          <ListItemAction
            key={a.type}
            title={a.title}
            subtitle={a.subtitle}
            tag={a.tag}
            icon={a.icon}
            mode={
              !a.isReuseable && usedActions.some(ua => ua.name === a.type)
                ? 'disabled'
                : 'default'
            }
            iconRight={<Icon icon={IconType.CHEVRON_RIGHT} />}
            onClick={() => handleActionClick(a.type)}
          />
        ))}
      </Container>
    </ModalBottomSheetSwitcher>
  );
};

export default AddActionMenu;

const Container = styled.div.attrs({
  className: 'space-y-3 p-6',
})``;
