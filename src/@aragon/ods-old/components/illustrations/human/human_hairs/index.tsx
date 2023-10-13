import React from 'react';

import {
  UnknownIllustrationVariantError,
  type IllustrationComponentProps,
  type Noneable,
} from '../../../../utils/illustrations';
import {Afro} from './afro';
import {Bald} from './bald';
import {Bun} from './bun';
import {Cool} from './cool';
import {Curly} from './curly';
import {CurlyBangs} from './curly_bangs';
import {Informal} from './informal';
import {Long} from './long';
import {Middle} from './middle';
import {Oldschool} from './oldschool';
import {Punk} from './punk';
import {Short} from './short';

export type Hair = Noneable<
  | 'long'
  | 'afro'
  | 'bald'
  | 'bun'
  | 'cool'
  | 'curly_bangs'
  | 'curly'
  | 'informal'
  | 'middle'
  | 'oldschool'
  | 'punk'
  | 'short'
>;

export const IllustrationHair: React.FC<IllustrationComponentProps<Hair>> = ({
  variant,
  ...rest
}) => {
  switch (variant) {
    case 'afro':
      return <Afro {...rest} />;
    case 'bald':
      return <Bald {...rest} />;
    case 'bun':
      return <Bun {...rest} />;
    case 'cool':
      return <Cool {...rest} />;
    case 'curly':
      return <Curly {...rest} />;
    case 'curly_bangs':
      return <CurlyBangs {...rest} />;
    case 'informal':
      return <Informal {...rest} />;
    case 'long':
      return <Long {...rest} />;
    case 'middle':
      return <Middle {...rest} />;
    case 'oldschool':
      return <Oldschool {...rest} />;
    case 'punk':
      return <Punk {...rest} />;
    case 'short':
      return <Short {...rest} />;
    case 'none':
      return null;
    default:
      throw new UnknownIllustrationVariantError(variant, 'hair');
  }
};
