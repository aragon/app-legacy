import {useCallback, useMemo, useState} from 'react';

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

export type GenericKeyEnum = string;
export type StepsMap<TStepKey extends GenericKeyEnum> = Record<
  TStepKey,
  StepData
>;

interface IUseFunctionStepper<TStepKey extends string> {
  initialSteps: StepsMap<TStepKey>;
}

export const useFunctionStepper = <TStepKey extends string>({
  initialSteps,
}: IUseFunctionStepper<TStepKey>) => {
  const [steps, setSteps] = useState<StepsMap<TStepKey>>(initialSteps);

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

  const updateStepStatus = useCallback(
    (stepId: TStepKey, status: StepStatus, errorMessage?: string) => {
      setSteps(prevSteps => ({
        ...prevSteps,
        [stepId]: {
          ...prevSteps[stepId],
          status: status,
          errorMessage,
        },
      }));
    },
    [setSteps]
  );

  const doStep = useCallback(
    async <T,>(stepId: TStepKey, callback: () => Promise<T>) => {
      let res: T;
      try {
        updateStepStatus(stepId, StepStatus.LOADING);
        res = await callback();
      } catch (e) {
        let message = 'Unknown Error';
        if (e instanceof Error) message = e.message;
        else message = String(e);
        updateStepStatus(stepId, StepStatus.ERROR, message);
        throw e;
      }
      updateStepStatus(stepId, StepStatus.SUCCESS);
      return res;
    },
    [updateStepStatus]
  );

  const resetStates = useCallback(() => {
    for (const stepKey in steps) {
      updateStepStatus(stepKey as TStepKey, StepStatus.WAITING);
    }
  }, [steps, updateStepStatus]);

  return {doStep, updateStepStatus, globalState, steps, resetStates};
};
