import {Client} from '@aragon/sdk-client';
import {useClient} from './useClient';
import {useState, useEffect, useCallback} from 'react';
import {resolveDaoAvatarIpfsCid} from 'utils/library';

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
      } catch (e) {
        console.error(e);
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
      } catch (e) {
        console.error(e);
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
