import {useMemo, useState} from 'react';

export enum StepStatus {
  WAITING = 'WAITING',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface StepData {
  status: StepStatus;
  errorMessage?: string;
}

export type GenericKeyEnum = string | number | symbol;

export type StepsMap<X extends GenericKeyEnum> = Record<X, StepData>;

interface IUseFunctionStepper<X extends GenericKeyEnum> {
  initialSteps: StepsMap<X>;
}

export const useFunctionStepper = <X extends GenericKeyEnum>({
  initialSteps,
}: IUseFunctionStepper<X>) => {
  const [steps, setSteps] = useState<StepsMap<X>>(initialSteps);

  const globalState: StepStatus = useMemo(() => {
    const stepsArray: StepData[] = Object.values(steps);
    // If any step has an ERROR status, return ERROR
    if (stepsArray.some(step => step.status === StepStatus.ERROR)) {
      return StepStatus.ERROR;
    }

    // If any step has a LOADING status, return LOADING
    if (stepsArray.some(step => step.status === StepStatus.LOADING)) {
      return StepStatus.LOADING;
    }

    // If all steps have a SUCCESS status, return SUCCESS
    if (stepsArray.every(step => step.status === StepStatus.SUCCESS)) {
      return StepStatus.SUCCESS;
    }

    // If all steps have a WAITING status, return WAITING
    if (stepsArray.every(step => step.status === StepStatus.WAITING)) {
      return StepStatus.WAITING;
    }

    return StepStatus.ERROR;
  }, [steps]);

  const updateStepStatus = (stepId: X, status: StepStatus) => {
    setSteps(prevSteps => ({
      ...prevSteps,
      [stepId]: {
        ...prevSteps[stepId],
        status: status,
      },
    }));
  };

  const doStep = async <T,>(
    stepId: X,
    callback: () => Promise<T>
  ): Promise<T> => {
    let res: T;
    try {
      updateStepStatus(stepId, StepStatus.LOADING);
      res = await callback();
    } catch (e) {
      updateStepStatus(stepId, StepStatus.ERROR);
      throw e;
    }
    updateStepStatus(stepId, StepStatus.SUCCESS);
    return res;
  };

  return {doStep, updateStepStatus, globalState, steps};
};
