import React from 'react';

import {
  UnknownIllustrationVariantError,
  type IllustrationComponentProps,
  type Noneable,
} from '../../../../utils/illustrations';
import {BigRounded} from './big_rounded';
import {BigSemirounded} from './big_semirounded';
import {LargeStylized} from './large_stylized';
import {LargeStylizedXl} from './large_stylized_xl';
import {Pirate} from './pirate';
import {SmallIntellectual} from './small_intellectual';
import {SmallSympathetic} from './small_sympathetic';
import {SmallWeirdOne} from './small_weird_one';
import {SmallWeirdTwo} from './small_weird_two';
import {Thuglife} from './thuglife';
import {ThuglifeRounded} from './thuglife_rounded';

export type Sunglass = Noneable<
  | 'big_rounded'
  | 'big_semirounded'
  | 'large_stylized_xl'
  | 'large_stylized'
  | 'pirate'
  | 'small_intellectual'
  | 'small_sympathetic'
  | 'small_weird_one'
  | 'small_weird_two'
  | 'thuglife_rounded'
  | 'thuglife'
>;

export const IllustrationSunglass: React.FC<
  IllustrationComponentProps<Sunglass>
> = ({variant, ...rest}) => {
  switch (variant) {
    case 'big_rounded':
      return <BigRounded {...rest} />;
    case 'big_semirounded':
      return <BigSemirounded {...rest} />;
    case 'large_stylized':
      return <LargeStylized {...rest} />;
    case 'large_stylized_xl':
      return <LargeStylizedXl {...rest} />;
    case 'pirate':
      return <Pirate {...rest} />;
    case 'small_intellectual':
      return <SmallIntellectual {...rest} />;
    case 'small_sympathetic':
      return <SmallSympathetic {...rest} />;
    case 'small_weird_one':
      return <SmallWeirdOne {...rest} />;
    case 'small_weird_two':
      return <SmallWeirdTwo {...rest} />;
    case 'thuglife':
      return <Thuglife {...rest} />;
    case 'thuglife_rounded':
      return <ThuglifeRounded {...rest} />;
    case 'none':
      return null;
    default:
      throw new UnknownIllustrationVariantError(variant, 'sunglasses');
  }
};
