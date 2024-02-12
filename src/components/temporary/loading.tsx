import {Spinner} from '@aragon/ods';
import React from 'react';

export const Loading: React.FC = () => {
  return (
    <div className="col-span-full mt-36 flex w-full flex-col items-center">
      <Spinner size="xl" variant="neutral" />
      <p className="my-8 text-center text-xl leading-normal">Loading...</p>
    </div>
  );
};
