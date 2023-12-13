/* eslint-disable tailwindcss/no-custom-classname */
import React from 'react';
import styled from 'styled-components';
import {
  shortenAddress,
  Avatar,
  ButtonIcon,
  Tag,
  IconChevronRight,
} from '@aragon/ods-old';
import {DaoMember} from 'utils/paths';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import {useNetwork} from 'context/network';
import {MemberVotingPower} from './memberVotingPower';
import {featureFlags} from 'utils/featureFlags';

/**
 * Type declarations for `ActionItemAddressProps`.
 */
export type ActionItemAddressProps = {
  /** Name of the dao */
  daoName?: boolean;

  /** Wallet address or ENS domain name. */
  addressOrEns: string;

  /** Optional ENS avatar URL. If not provided and the wallet address is valid,
   *  it will be used to generate a Blockies avatar.
   */
  avatar?: string;
};

/**
 * `ActionItemAddress` component: Displays an address item with associated actions.
 * @param props - Component properties following `ActionItemAddressProps` type.
 * @returns JSX Element.
 */
export const ActionItemMembership: React.FC<ActionItemAddressProps> = props => {
  const {addressOrEns, avatar} = props;

  const {network} = useNetwork();
  const navigate = useNavigate();
  const {dao} = useParams();

  const enableDelegation =
    featureFlags.getValue('VITE_FEATURE_FLAG_DELEGATION') === 'true';

  return (
    <div className="flex">
      <Avatar size="small" mode="circle" src={avatar ?? addressOrEns} />
      <div className="flex flex-col">
        <Title>DAO</Title>
        <Address>0x123123123123123123123123312123123312123</Address>
        <Activity>-</Activity>
      </div>
    </div>
  );
};

const Title = styled.span.attrs({
  className: 'ft-text-lg text-ui-800',
})``;

const Address = styled.span.attrs({
  className: 'ft-text-base text-ui-500' as string,
})``;

const Activity = styled.div.attrs({
  className: 'ft-text-sm text-ui-500' as string,
})``;
