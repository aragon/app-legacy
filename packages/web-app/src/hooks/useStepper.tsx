import {useCallback, useState} from 'react';

export const useStepper = (totalSteps: number) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  /**************************************************
   *            Functions and Callbacks             *
   **************************************************/
  /** Function used for navigating to the next step in the process */
  const gotoNextStep = useCallback(() => {
    if (currentStep !== totalSteps) {
      setCurrentStep(current => current + 1);
    }
  }, [currentStep, totalSteps]);

  /** Function used for navigating to the previous step in the process */
  const gotoPreviousStep = useCallback(() => {
    if (currentStep !== 1) {
      setCurrentStep(current => current - 1);
    }
  }, [currentStep]);

  const setStep = useCallback(
    newStep => {
      setCurrentStep(newStep);
    },
    [setCurrentStep]
  );

  return {currentStep, prev: gotoPreviousStep, next: gotoNextStep, setStep};
};
