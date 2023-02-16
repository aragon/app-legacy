import {TFunction} from 'react-i18next';

type TParam0 = Parameters<TFunction<'translation', undefined>>[0];

export const htmlIn =
  (t: TFunction<'translation', undefined>) => (key: TParam0) => {
    let value = t(key, {link: '<<link>>'}) as string;
    if (value.includes('<<link>>')) {
      const linkUrl = t((key + 'LinkURL') as TParam0);
      const linkLabel = t((key + 'LinkLabel') as TParam0);
      value = value.replace(
        '<<link>>',
        `<a href="${linkUrl}">${linkLabel}</a>`
      );
    }
    return value;
  };
