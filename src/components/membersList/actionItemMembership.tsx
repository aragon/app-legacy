/* eslint-disable tailwindcss/no-custom-classname */
import React, {useEffect, useState} from 'react';
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
import {resolveIpfsCid} from '@aragon/sdk-client-common';
import {useClient} from 'hooks/useClient';
import {Client, DaoListItem} from '@aragon/sdk-client';
import {toDisplayEns} from 'utils/library';

/**
 * Type declarations for `ActionItemAddressProps`.
 */
export type ActionItemAddressProps = {
  /** Name of the dao */
  daoName?: boolean;

  /** Wallet address or ENS domain name. */
  address: string;
  subdomain: string;
  metadata?: string;
};

/**
 * `ActionItemAddress` component: Displays an address item with associated actions.
 * @param props - Component properties following `ActionItemAddressProps` type.
 * @returns JSX Element.
 */
export const ActionItemMembership: React.FC<ActionItemAddressProps> = props => {
  const {address, subdomain, metadata} = props;
  const {client} = useClient();
  const [avatarSrc, setAvatarSrc] = useState('');
  const [metadataObject, setMetadataObject] = useState<DaoListItem['metadata']>(
    {
      name: '',
      description: '',
      avatar: '',
    }
  );

  useEffect(() => {
    async function getMetadata() {
      if (!metadata || !client) return null;

      const cid = resolveIpfsCid(metadata);
      const ipfsClientString = await (client as Client)?.ipfs.fetchString(cid);
      const ipfsClient = JSON.parse(ipfsClientString);

      setMetadataObject(ipfsClient);

      if (ipfsClient?.avatar) {
        try {
          const avatarCID = resolveIpfsCid(ipfsClient!.avatar);
          console.log('testthis', ipfsClient?.avatar);
          const ipfsClient = client.ipfs.getClient();
          const imageBytes = await ipfsClient.cat(avatarCID); // Uint8Array
          const imageBlob = new Blob([imageBytes] as unknown as BlobPart[]);

          console.log('testthis', ipfsClient, imageBytes);

          setAvatarSrc(URL.createObjectURL(imageBlob));
        } catch (err) {
          console.warn('Error resolving DAO avatar IPFS Cid', err);
        }
      }
    }

    getMetadata();
  }, [client, metadata]);

  return (
    <a
      className={
        'flex flex-row items-center justify-between gap-3' +
        'cursor-pointer rounded-xl border border-neutral-100 bg-neutral-0 px-4 py-3' +
        'focus:outline-none focus-visible:ring focus-visible:ring-primary focus-visible:ring-offset' +
        'hover:border-neutral-200 hover:shadow-neutral-md active:border-neutral-300' +
        'md:gap-4 md:px-6 md:py-3.5'
      }
    >
      <div className="flex space-x-3">
        <div className="mt-1">
          <Avatar size="default" mode="circle" src={avatarSrc ?? address} />
        </div>
        <div className="flex flex-col">
          <Title>{metadataObject.name}</Title>
          <Address>
            {toDisplayEns(subdomain) || shortenAddress(address)}
          </Address>
          <Activity>-</Activity>
        </div>
      </div>
      <IconChevronRight />
    </a>
  );
};

const Title = styled.span.attrs({
  className: 'ft-text-lg text-neutral-800',
})``;

const Address = styled.span.attrs({
  className: 'ft-text-base text-neutral-500' as string,
})``;

const Activity = styled.div.attrs({
  className: 'ft-text-sm text-neutral-500' as string,
})``;
