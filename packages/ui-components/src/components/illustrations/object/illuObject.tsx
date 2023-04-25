import React, {HTMLAttributes} from 'react';

import {UnknownIllustrationVariantError} from '../../../utils/illustrations';
import {Action} from './action';
import {App} from './app';
import {Archive} from './archive';
import {Book} from './book';
import {Build} from './build';
import {Chain} from './chain';
import {Database} from './database';
import {Error} from './error';
import {Explore} from './explore';
import {Gas} from './gas';
import {Labels} from './labels';
import {LightBulb} from './lightbulb';
import {MagnifyingGlass} from './magnifyingGlass';
import {Security} from './security';
import {Settings} from './settings';
import {SmartContract} from './smartContract';
import {Users} from './users';
import {Wagmi} from './wagmi';
import {Wallet} from './wallet';
import {Warning} from './warning';
import {NotFound} from './notFound';
import {Goal} from './goal';
import {Success} from './success';

export const objectNames = [
  'action',
  'app',
  'archive',
  'book',
  'build',
  'chain',
  'database',
  'error',
  'explore',
  'gas',
  'goal',
  'labels',
  'lightbulb',
  'magnifying_glass',
  'not_found',
  'security',
  'settings',
  'smart_contract',
  'success',
  'users',
  'warning',
  'wagmi',
  'wallet',
] as const;

export type IlluObjectProps = {
  object: typeof objectNames[number];
};

export const IlluObject: React.FC<
  IlluObjectProps & HTMLAttributes<HTMLElement>
> = ({object, ...rest}) => {
  switch (object) {
    case 'action':
      return <Action {...rest} data-testid="illu-object" />;
    case 'app':
      return <App {...rest} data-testid="illu-object" />;
    case 'archive':
      return <Archive {...rest} data-testid="illu-object" />;
    case 'book':
      return <Book {...rest} data-testid="illu-object" />;
    case 'build':
      return <Build {...rest} data-testid="illu-object" />;
    case 'chain':
      return <Chain {...rest} data-testid="illu-object" />;
    case 'database':
      return <Database {...rest} data-testid="illu-object" />;
    case 'error':
      return <Error {...rest} data-testid="illu-object" />;
    case 'explore':
      return <Explore {...rest} data-testid="illu-object" />;
    case 'gas':
      return <Gas {...rest} data-testid="illu-object" />;
    case 'goal':
      return <Goal {...rest} data-testid="illu-object" />;
    case 'labels':
      return <Labels {...rest} data-testid="illu-object" />;
    case 'lightbulb':
      return <LightBulb {...rest} data-testid="illu-object" />;
    case 'magnifying_glass':
      return <MagnifyingGlass {...rest} data-testid="illu-object" />;
    case 'not_found':
      return <NotFound {...rest} data-testid="illu-object" />;
    case 'security':
      return <Security {...rest} data-testid="illu-object" />;
    case 'settings':
      return <Settings {...rest} data-testid="illu-object" />;
    case 'smart_contract':
      return <SmartContract {...rest} data-testid="illu-object" />;
    case 'success':
      return <Success {...rest} data-testid="illu-object" />;
    case 'users':
      return <Users {...rest} data-testid="illu-object" />;
    case 'wagmi':
      return <Wagmi {...rest} data-testid="illu-object" />;
    case 'wallet':
      return <Wallet {...rest} data-testid="illu-object" />;
    case 'warning':
      return <Warning {...rest} data-testid="illu-object" />;
    default:
      throw new UnknownIllustrationVariantError(object, 'expression');
  }
};
