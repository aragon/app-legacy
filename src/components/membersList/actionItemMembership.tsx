import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {shortenAddress, Avatar, IconChevronRight} from '@aragon/ods-old';
import {resolveIpfsCid} from '@aragon/sdk-client-common';
import {useClient} from 'hooks/useClient';
import {Client, DaoListItem} from '@aragon/sdk-client';
import {toDisplayEns} from 'utils/library';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import {Dashboard} from 'utils/paths';

/**
 * Type declarations for `ActionItemAddressProps`.
 */
export type ActionItemAddressProps = {
  /** Name of the dao */
  daoName?: boolean;

  /** Wallet address or ENS domain name. */
  address: string;
  subdomain: string;
  network: string;
  metadata?: string;
};

/**
 * `ActionItemAddress` component: Displays an address item with associated actions.
 * @param props - Component properties following `ActionItemAddressProps` type.
 * @returns JSX Element.
 */
export const ActionItemMembership: React.FC<ActionItemAddressProps> = props => {
  const {address, subdomain, metadata, network} = props;
  const {client} = useClient();
  const {t} = useTranslation();
  const navigate = useNavigate();
  const [metadataObject, setMetadataObject] = useState<DaoListItem['metadata']>(
    {
      name: '',
      description: '',
      avatar: '',
    }
  );

  const handleDaoClicked = (dao: string, network: string) => {
    navigate(
      generatePath(Dashboard, {
        network: network,
        dao,
      })
    );
  };

  useEffect(() => {
    async function getMetadata() {
      if (!metadata || !client) return null;

      const cid = resolveIpfsCid(metadata);
      const ipfsClientString = await (client as Client)?.ipfs.fetchString(cid);
      const ipfsClient = JSON.parse(ipfsClientString);

      setMetadataObject(ipfsClient);
    }

    getMetadata();
  }, [client, metadata]);

  return (
    <a
      className={
        'flex flex-row items-center justify-between gap-3 ' +
        'cursor-pointer rounded-xl border border-neutral-100 bg-neutral-0 px-4 py-3 ' +
        'md:gap-4 md:px-6 md:py-3.5'
      }
      onClick={() => handleDaoClicked(address, network)}
    >
      <div className="flex space-x-3">
        <div className="mt-1">
          <Avatar size="small" mode="circle" src={address} />
        </div>
        <div className="flex flex-col">
          <Title>
            {metadata ? metadataObject.name || '' : 'No name found'}
          </Title>
          <Address>
            {toDisplayEns(subdomain) || shortenAddress(address)}
          </Address>
          <Activity>
            {t('members.profile.labelLatestActivity', {
              time: '-',
            })}
          </Activity>
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
  className: 'ft-text-sm text-neutral-500 mt-2' as string,
})``;
