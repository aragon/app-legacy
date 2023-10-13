import React from 'react';

import {
  UnknownIllustrationVariantError,
  type IllustrationComponentProps,
  type Noneable,
} from '../../../../utils/illustrations';
import {Buddha} from './buddha';
import {EarringsCircle} from './earrings_circle';
import {EarringsHoops} from './earrings_hoops';
import {EarringsRhombus} from './earrings_rhombus';
import {EarringsSkull} from './earrings_skull';
import {EarringsThunder} from './earrings_thunder';
import {Expression} from './expression';
import {Flushed} from './flushed';
import {HeadFlower} from './head_flower';
import {Piercings} from './piercings';
import {PiercingsTattoo} from './piercings_tattoo';

export type Accessory = Noneable<
  | 'buddha'
  | 'earrings_circle'
  | 'earrings_hoops'
  | 'earrings_rhombus'
  | 'earrings_skull'
  | 'earrings_thunder'
  | 'expression'
  | 'flushed'
  | 'head_flower'
  | 'piercings_tattoo'
  | 'piercings'
>;

export const IllustrationAccessory: React.FC<
  IllustrationComponentProps<Accessory>
> = ({variant, ...rest}) => {
  switch (variant) {
    case 'buddha':
      return <Buddha {...rest} />;
    case 'earrings_circle':
      return <EarringsCircle {...rest} />;
    case 'earrings_hoops':
      return <EarringsHoops {...rest} />;
    case 'earrings_rhombus':
      return <EarringsRhombus {...rest} />;
    case 'earrings_skull':
      return <EarringsSkull {...rest} />;
    case 'earrings_thunder':
      return <EarringsThunder {...rest} />;
    case 'expression':
      return <Expression {...rest} />;
    case 'flushed':
      return <Flushed {...rest} />;
    case 'head_flower':
      return <HeadFlower {...rest} />;
    case 'piercings':
      return <Piercings {...rest} />;
    case 'piercings_tattoo':
      return <PiercingsTattoo {...rest} />;
    case 'none':
      return null;
    default:
      throw new UnknownIllustrationVariantError(variant, 'accessory');
  }
};
