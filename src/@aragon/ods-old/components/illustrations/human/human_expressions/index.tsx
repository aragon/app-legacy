import React from 'react';

import {
  UnknownIllustrationVariantError,
  type IllustrationComponentProps,
} from '../../../../utils/illustrations';
import {Angry} from './angry';
import {Casual} from './casual';
import {Crying} from './crying';
import {Decided} from './decided';
import {Excited} from './excited';
import {SadLeft} from './sad_left';
import {SadRight} from './sad_right';
import {Smile} from './smile';
import {SmileWink} from './smile_wink';
import {Surprised} from './surprised';
import {Suspecting} from './suspecting';

export type Expression =
  | 'angry'
  | 'casual'
  | 'crying'
  | 'decided'
  | 'excited'
  | 'sad_left'
  | 'sad_right'
  | 'smile_wink'
  | 'smile'
  | 'surprised'
  | 'suspecting';

export const IllustrationExpression: React.FC<
  IllustrationComponentProps<Expression>
> = ({variant, ...rest}) => {
  switch (variant) {
    case 'angry':
      return <Angry {...rest} />;
    case 'casual':
      return <Casual {...rest} />;
    case 'crying':
      return <Crying {...rest} />;
    case 'decided':
      return <Decided {...rest} />;
    case 'excited':
      return <Excited {...rest} />;
    case 'sad_left':
      return <SadLeft {...rest} />;
    case 'sad_right':
      return <SadRight {...rest} />;
    case 'smile':
      return <Smile {...rest} />;
    case 'smile_wink':
      return <SmileWink {...rest} />;
    case 'surprised':
      return <Surprised {...rest} />;
    case 'suspecting':
      return <Suspecting {...rest} />;
    default:
      throw new UnknownIllustrationVariantError(variant, 'expression');
  }
};
