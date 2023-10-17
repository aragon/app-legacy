import {TFunction} from 'i18next';

type TParam0 = Parameters<TFunction<'translation', undefined>>[0];

export const htmlIn =
  (t: TFunction<'translation', undefined>) =>
  (
    key: TParam0,
    args: Record<string, string | number | null | undefined> = {}
  ) => {
    let value = t(key, {...args, link: '<<link>>'}) as string;
    if (value.includes('<<link>>')) {
      const linkUrl = t((key + 'LinkURL') as TParam0);
      const linkLabel = t((key + 'LinkLabel') as TParam0);
      value = value.replace(
        '<<link>>',
        `<a class="font-semibold truncate inline-flex items-center space-x-3 max-w-full rounded cursor-pointer hover:text-primary-700 active:text-primary-800 focus-visible:ring-2 focus-visible:ring-primary-500 text-primary-500" href="${linkUrl}" target=”_blank”>${linkLabel}</a>`
      );
    }
    return value;
  };
