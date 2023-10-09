import {Spinner} from '@aragon/ods';
import React from 'react';

export const Loading: React.FC = () => {
  return (
    <div className="col-span-full mt-36 flex w-full flex-col items-center">
      <Spinner size="big" />
      <p className="my-4 text-center text-lg">Loading...</p>
    </div>
  );
};
