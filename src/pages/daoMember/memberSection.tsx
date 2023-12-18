import React, {ReactNode} from 'react';

export interface IMemberSectionProps {
  title: string;
  children: ReactNode;
}

export const MemberSection: React.FC<IMemberSectionProps> = props => {
  const {title, children} = props;

  return (
    <div className="flex grow flex-col gap-4">
      <p className="font-normal text-neutral-800 ft-text-xl">{title}</p>
      {children}
    </div>
  );
};
