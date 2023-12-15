import {IlluObject, IlluObjectProps} from '@aragon/ods-old';
import React, {ReactNode} from 'react';

export interface IMemberSectionProps {
  title: string;
  empty: {title: string; illustration: IlluObjectProps['object']};
  isEmpty?: boolean;
  children: ReactNode;
}

export const MemberSection: React.FC<IMemberSectionProps> = props => {
  const {title, empty, isEmpty, children} = props;
  const {title: emptyTitle, illustration: emptyIllustration} = empty;

  if (isEmpty) {
    return (
      <div className="flex grow flex-row items-center justify-between gap-4 rounded-xl border border-neutral-100 bg-neutral-0 px-6 py-5">
        <p className="text-lg font-semibold leading-tight">{emptyTitle}</p>
        <div className="rounded-full bg-neutral-50 p-2">
          <IlluObject
            object={emptyIllustration}
            className="h-16 w-16 md:h-20 md:w-20"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex grow flex-col gap-4">
      <p className="font-normal text-neutral-800 ft-text-xl">{title}</p>
      {children}
    </div>
  );
};
