import {TFunction} from 'react-i18next';

export const htmlIn =
  (t: TFunction<'translation', undefined>) => (key: any) => {
    let value = t(key, {link: '<<link>>'});
    if (value.includes('<<link>>')) {
      const linkUrl = t((key + 'LinkURL') as any);
      const linkLabel = t((key + 'LinkLabel') as any);
      value = value.replace(
        '<<link>>',
        `<a href="${linkUrl}">${linkLabel}</a>`
      );
    }
    return value;
  };
