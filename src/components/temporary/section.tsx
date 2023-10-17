import React, {ReactNode} from 'react';

type TemporarySectionProps = {
  children?: ReactNode;
  purpose?: string;
};

export const TemporarySection: React.FC<TemporarySectionProps> = ({
  children,
  purpose = '',
}) => {
  return (
    <div className="m-10 space-y-1 bg-primary-100 p-2">
      <p>
        This is a temporarily added section for demonstration purposes.{' '}
        {purpose}
      </p>
      {children}
    </div>
  );
};
