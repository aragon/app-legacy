import {
  DaoDetails,
  DaoMetadata,
  InstalledPluginListItem,
} from '@aragon/sdk-client';
import {gql} from 'graphql-request';
import {SubgraphDao, SubgraphPluginListItem} from 'utils/types';

export const QueryDao = gql`
  query Dao($address: ID!) {
    dao(id: $address) {
      id
      subdomain
      metadata
      createdAt
      plugins {
        appliedPreparation {
          pluginAddress
        }
        appliedPluginRepo {
          subdomain
        }
        appliedVersion {
          build
          release {
            release
          }
        }
      }
    }
  }
`;

export function toDaoDetails(
  dao: SubgraphDao,
  metadata: DaoMetadata
): DaoDetails {
  return {
    address: dao.id,
    ensDomain: dao.subdomain + '.dao.eth',
    metadata: {
      name: metadata?.name,
      description: metadata?.description,
      avatar: metadata?.avatar || undefined,
      links: metadata?.links,
    },
    creationDate: new Date(parseInt(dao.createdAt) * 1000),
    // filter out plugins that are not applied
    plugins: dao.plugins
      .filter(
        plugin =>
          plugin.appliedPreparation &&
          plugin.appliedVersion &&
          plugin.appliedPluginRepo
      )
      .map(
        (plugin: SubgraphPluginListItem): InstalledPluginListItem => ({
          // we checked with the filter above that these are not null
          id: `${plugin.appliedPluginRepo!.subdomain}.plugin.dao.eth`,
          release: plugin.appliedVersion!.release.release,
          build: plugin.appliedVersion!.build,
          instanceAddress: plugin.appliedPreparation!.pluginAddress,
        })
      ),
  };
}
