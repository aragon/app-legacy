import React, {type SyntheticEvent} from 'react';
import {styled} from 'styled-components';

import FallbackImg from '../../assets/avatar-token.svg';
import {IconRadioDefault, IconSuccess} from '../icons';
import {Tag} from '../tag';

export type ListItemBlockchainProps = {
  domain: string;
  logo?: string;
  name: string;
  selected?: boolean;
  tag?: string;
  onClick?: React.MouseEventHandler;
};

export const ListItemBlockchain: React.FC<ListItemBlockchainProps> = ({
  selected = false,
  ...props
}) => {
  return (
    <Container selected={selected} {...props} data-testid="listItem-blockchain">
      <Logo
        src={props.logo ?? FallbackImg}
        onError={(e: SyntheticEvent<HTMLImageElement, Event>) => {
          e.currentTarget.src = FallbackImg;
        }}
      />
      <Content>
        <Domain selected={selected}>{props.name}</Domain>
        <Name>{props.domain}</Name>
      </Content>
      {props.tag && <Tag label={props.tag} colorScheme="info" />}
      {selected ? (
        <IconSuccess width={20} height={20} className="text-primary-500" />
      ) : (
        <IconRadioDefault width={20} height={20} className="text-neutral-400" />
      )}
    </Container>
  );
};

type SelectedProps = {
  selected: boolean;
};
const Container = styled.div.attrs<SelectedProps>(({selected}) => {
  const className = `${
    selected ? 'bg-neutral-0' : 'bg-neutral-50'
  } flex items-center p-4 space-x-4 rounded-xl cursor-pointer`;
  return {className};
})<SelectedProps>``;

const Domain = styled.p.attrs<SelectedProps>(({selected}) => ({
  className: `${
    selected ? 'text-primary-500' : 'text-neutral-600'
  } font-semibold`,
}))<SelectedProps>``;

const Name = styled.p.attrs({className: 'ft-text-sm text-neutral-500'})``;

const Logo = styled.img.attrs({className: 'w-12 h-12'})``;

const Content = styled.div.attrs({className: 'flex-1'})``;
