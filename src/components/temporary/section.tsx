import React from 'react';

type TemporarySectionProps = {
  purpose?: string;
};

export const TemporarySection: React.FC<TemporarySectionProps> = ({
  children,
  purpose = '',
}) => {
  return (
    <div className="m-5 space-y-1 bg-primary-100 p-2">
      <p>
        This is a temporarily added section for demonstration purposes.{' '}
        {purpose}
      </p>
      {children}
    </div>
  );
};
