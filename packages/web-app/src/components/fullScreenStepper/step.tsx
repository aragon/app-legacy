import React, {ReactElement} from 'react';

export type StepProps = {
  includeStepper?: boolean;
  wizardTitle?: string;
  wizardDescription?: string | React.ReactNode;
  hideWizard?: boolean;
  fullWidth?: boolean;
  customHeader?: ReactElement;
  customFooter?: ReactElement;
  backButtonLabel?: string;
  nextButtonLabel?: string;
  isNextButtonDisabled?: boolean;
  onBackButtonClicked?: () => void;
  onNextButtonClicked?: (next: () => void) => void;
  // This method can use to trigger validations once user clicked on disabled next button
  onNextButtonDisabledClicked?: () => void;
};

export const Step: React.FC<StepProps> = ({children}) => {
  return <>{children}</>;
};
