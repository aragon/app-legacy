import {Spinner} from '@aragon/ui-components';
import React from 'react';

export const Loading: React.FC = () => {
  return (
    <div className="flex fixed top-1/3 right-px flex-col items-center w-full">
      <Spinner size="big" />
    </div>
  );
};
