import {Button} from '@aragon/ods';
import {IlluObject, IlluObjectProps} from '@aragon/ods-old';
import React from 'react';
import {useHref} from 'react-router-dom';

export interface IEmptyMemberSectionProps {
  title: string;
  illustration: IlluObjectProps['object'];
  link: {label: string; href: string};
}

export const EmptyMemberSection: React.FC<IEmptyMemberSectionProps> = props => {
  const {title, illustration, link} = props;

  const processedLink = useHref(link.href);

  return (
    <div className="flex grow flex-row items-center justify-between gap-4 rounded-xl border border-neutral-100 bg-neutral-0 px-6 py-5">
      <div className="flex grow flex-col items-start gap-4">
        <p className="text-base font-semibold leading-tight md:text-lg">
          {title}
        </p>
        <Button
          variant="tertiary"
          size="sm"
          href={processedLink}
          className="md:hidden"
        >
          {link.label}
        </Button>
      </div>
      <div className="rounded-full bg-neutral-50 p-2">
        <IlluObject
          object={illustration}
          className="h-16 w-16 md:h-20 md:w-20"
        />
      </div>
    </div>
  );
};
