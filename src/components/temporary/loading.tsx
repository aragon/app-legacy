import {Spinner} from '@aragon/ods-old';
import React from 'react';

export const Loading: React.FC = () => {
  return (
    <div className="col-span-full mt-36 flex w-full flex-col items-center">
      <Spinner size="big" />
      <p className="my-8 text-center text-lg">Loading...</p>
    </div>
  );
};
