import {Client} from '@aragon/sdk-client';
import {useClient} from './useClient';
import {useState, useEffect, useCallback} from 'react';
import {resolveDaoAvatarIpfsCid} from 'utils/library';
import {logger, logMeta} from '../services/logger';

const llo = logMeta.bind(null, {service: 'hooks:useResolveDaoAvatar'});

export function useResolveDaoAvatar(
  avatarInput?: string | Blob | string[] | Blob[]
) {
  const {client} = useClient();
  const [avatar, setAvatar] = useState('');
  const [avatars, setAvatars] = useState<string[]>([]);

  const resolveAvatar = useCallback(
    async (clientInstance: Client | undefined, input: string | Blob) => {
      try {
        const result = await resolveDaoAvatarIpfsCid(clientInstance, input);
        setAvatar(result || '');
      } catch (error) {
        logger.error('Error resolving DAO avatar', llo({error, input}));
      }
    },
    []
  );

  const resolveAvatars = useCallback(
    async (clientInstance: Client | undefined, input: string[] | Blob[]) => {
      try {
        const promisesResult = input.map(item => {
          return resolveDaoAvatarIpfsCid(clientInstance, item);
        });

        let results = await Promise.all(promisesResult);
        results = results.map(avatar => avatar || '');

        setAvatars(results as unknown as string[]);
      } catch (error) {
        logger.error('Error resolving DAO avatars', llo({error, input}));
      }
    },
    []
  );

  useEffect(() => {
    if (avatarInput && !Array.isArray(avatarInput)) {
      resolveAvatar(client, avatarInput);
    }
  }, [avatarInput, client, resolveAvatar]);

  useEffect(() => {
    if (avatarInput && Array.isArray(avatarInput)) {
      resolveAvatars(client, avatarInput);
    }
  }, [avatarInput, client, resolveAvatars]);

  return {avatar, avatars};
}
