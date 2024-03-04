import React from 'react';
import {styled} from 'styled-components';

import {shortenAddress} from '../../utils/addresses';
import {AvatarDao} from '../avatar';
import {Icon, IconType} from '@aragon/ods';

// TODO: Refactor to use input type radio for accessibility

export type ListItemDaoProps = {
  /** Dao's ethereum address **or** ENS name */
  daoAddress: string;
  daoLogo?: string;
  daoName: string;
  selected?: boolean;
  /** Handler for ListItem selection */
  onClick?: React.MouseEventHandler;
};

/**
 * List item for DAO selection. Used for switching to different DAO.
 */
export const ListItemDao: React.FC<ListItemDaoProps> = props => {
  return (
    <Container selected={props.selected} onClick={props.onClick}>
      <AvatarDao daoName={props.daoName} src={props.daoLogo} />
      <Content>
        <DaoName selected={props.selected}>{props.daoName}</DaoName>
        <Domain>{shortenAddress(props.daoAddress)}</Domain>
      </Content>
      <IconContainer selected={props.selected}>
        {props.selected ? (
          <Icon icon={IconType.SUCCESS} />
        ) : (
          <Icon icon={IconType.RADIO} />
        )}
      </IconContainer>
    </Container>
  );
};

type Selectable = Pick<ListItemDaoProps, 'selected'>;

const Container = styled.button.attrs<Selectable>(({selected}) => {
  const baseClasses =
    'group flex items-center p-4 space-x-4  w-full rounded-xl' +
    ' focus-visible:ring focus-visible:ring-primary focus:outline-none';

  return {
    className: selected
      ? `${baseClasses} bg-neutral-0`
      : `${baseClasses} hover:bg-neutral-50 focus:bg-neutral-50 active:bg-neutral-0`,
  };
})<Selectable>``;

const Content = styled.div.attrs({
  className: 'flex-1 text-left min-w-0',
})``;

const Domain = styled.p.attrs({
  className: 'ft-text-sm text-neutral-500 truncate',
})``;

const DaoName = styled.p.attrs<Selectable>(({selected}) => {
  return {
    className: selected
      ? 'font-semibold truncate text-primary-500'
      : 'truncate font-semibold text-neutral-600 group-hover:text-primary-500 group-active:text-primary-500',
  };
})<Selectable>``;

const IconContainer = styled.div.attrs<Selectable>(({selected}) => {
  return {
    className: selected
      ? 'ft-text-sm text-primary-500'
      : 'ft-text-sm text-neutral-400 group-hover:text-primary-500 group-active:text-primary-500',
  };
})<Selectable>``;
