import {IlluObject, IlluObjectProps} from '@aragon/ods-old';
import React from 'react';

export interface IEmptyMemberSectionProps {
  title: string;
  illustration: IlluObjectProps['object'];
}

export const EmptyMemberSection: React.FC<IEmptyMemberSectionProps> = props => {
  const {title, illustration} = props;

  return (
    <div className="flex grow flex-row items-center justify-between gap-4 rounded-xl border border-neutral-100 bg-neutral-0 px-6 py-5">
      <p className="text-lg font-semibold leading-tight">{title}</p>
      <div className="rounded-full bg-neutral-50 p-2">
        <IlluObject
          object={illustration}
          className="h-16 w-16 md:h-20 md:w-20"
        />
      </div>
    </div>
  );
};
