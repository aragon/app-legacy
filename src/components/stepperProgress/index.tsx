import React from 'react';
import styled from 'styled-components';
import {StepData, StepsMap} from '../../hooks/useFunctionStepper';
import {StepLine} from './StepLine';

export type StepperLabels<TStepKey extends string> = Record<
  TStepKey,
  {
    title: string;
    helper?: string;
  }
>;

export const StepperModalProgress = <TStepKey extends string>({
  steps,
  labels,
}: {
  steps: StepsMap<TStepKey>;
  labels: StepperLabels<TStepKey>;
}) => {
  if (!steps) {
    return null;
  }

  return (
    <StepList>
      {Object.entries(steps).map(([id, step], i) => {
        return (
          <StepLine
            key={i}
            {...labels[id as TStepKey]}
            {...(step as StepData)}
          />
        );
      })}
    </StepList>
  );
};

const StepList = styled.div.attrs({
  className: 'flex flex-col gap-1',
})``;
