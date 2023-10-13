import React from 'react';

import {
  UnknownIllustrationVariantError,
  type IllustrationComponentProps,
} from '../../../../utils/illustrations';
import {Aragon} from './aragon';
import {Blocks} from './blocks';
import {Chart} from './chart';
import {Computer} from './computer';
import {ComputerCorrect} from './computer_correct';
import {Correct} from './correct';
import {DoubleCorrect} from './double_correct';
import {Elevating} from './elevating';
import {Relaxed} from './relaxed';
import {SendingLove} from './sending_love';
import {Voting} from './voting';

export type Body =
  | 'relaxed'
  | 'aragon'
  | 'blocks'
  | 'chart'
  | 'computer_correct'
  | 'computer'
  | 'correct'
  | 'double_correct'
  | 'elevating'
  | 'sending_love'
  | 'voting';

export const IllustrationBodies: React.FC<IllustrationComponentProps<Body>> = ({
  variant,
  ...rest
}) => {
  switch (variant) {
    case 'aragon':
      return <Aragon {...rest} />;
    case 'blocks':
      return <Blocks {...rest} />;
    case 'chart':
      return <Chart {...rest} />;
    case 'computer':
      return <Computer {...rest} />;
    case 'computer_correct':
      return <ComputerCorrect {...rest} />;
    case 'correct':
      return <Correct {...rest} />;
    case 'double_correct':
      return <DoubleCorrect {...rest} />;
    case 'elevating':
      return <Elevating {...rest} />;
    case 'relaxed':
      return <Relaxed {...rest} />;
    case 'sending_love':
      return <SendingLove {...rest} />;
    case 'voting':
      return <Voting {...rest} />;
    default:
      throw new UnknownIllustrationVariantError(variant, 'body');
  }
};
