import {Spinner} from '@aragon/ui-components';
import React from 'react';

export const Loading: React.FC = () => {
  return (
    <div className="flex flex-col col-span-full items-center mt-36 w-full">
      <Spinner size="big" />
      <p className="my-4 text-lg text-center">Loading...</p>
    </div>
  );
};
