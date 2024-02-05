import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {shortenAddress, AvatarDao} from '@aragon/ods-old';
import {Icon, IconType} from '@aragon/ods';
import {resolveIpfsCid} from '@aragon/sdk-client-common';
import {useClient} from 'hooks/useClient';
import {Client, DaoListItem} from '@aragon/sdk-client';
import {toDisplayEns} from 'utils/library';
import {generatePath, useNavigate} from 'react-router-dom';
import {DaoMember} from 'utils/paths';
import {useResolveDaoAvatar} from 'hooks/useResolveDaoAvatar';
import {useQueryClient} from '@tanstack/react-query';
import {aragonSdkQueryKeys} from 'services/aragon-sdk/query-keys';
import {SupportedNetworks} from 'utils/constants';
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
  memberAddress: string;
};

/**
 * `ActionItemAddress` component: Displays an address item with associated actions.
 * @param props - Component properties following `ActionItemAddressProps` type.
 * @returns JSX Element.
 */
export const ActionItemMembership: React.FC<ActionItemAddressProps> = props => {
  const {address, memberAddress, subdomain, metadata, network} = props;
  const {client} = useClient();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [metadataObject, setMetadataObject] = useState<DaoListItem['metadata']>(
    {
      name: '',
      description: '',
      avatar: '',
    }
  );
  const {avatar} = useResolveDaoAvatar(metadataObject.avatar);

  const baseParams = {
    address: memberAddress as string,
    network: network as SupportedNetworks,
  };

  const handleDaoClicked = (dao: string, network: string) => {
    const memberskey = aragonSdkQueryKeys.getMemberDAOs(baseParams);
    queryClient.invalidateQueries(memberskey);
    navigate(
      generatePath(DaoMember, {
        network,
        dao,
        user: memberAddress,
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

  const DAOName = metadataObject ? metadataObject.name || '-' : 'No name found';

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
          <AvatarDao size="small" src={avatar} daoName={DAOName} />
        </div>
        <div className="flex flex-col">
          <Title>{DAOName}</Title>
          <Address>
            {toDisplayEns(subdomain) || shortenAddress(address)}
          </Address>
          {/* <Activity>
            {t('members.profile.labelLatestActivity', {
              time: '-',
            })}
          </Activity> */}
        </div>
      </div>
      <Icon icon={IconType.CHEVRON_RIGHT} />
    </a>
  );
};

const Title = styled.span.attrs({
  className: 'ft-text-lg text-neutral-800',
})``;

const Address = styled.span.attrs({
  className: 'ft-text-base text-neutral-500' as string,
})``;

// const Activity = styled.div.attrs({
//   className: 'ft-text-sm text-neutral-500 mt-2' as string,
// })``;
