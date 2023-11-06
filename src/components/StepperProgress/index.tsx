import React from 'react';
import styled from 'styled-components';
import {
  GenericKeyEnum,
  StepData,
  StepsMap,
} from '../../hooks/useFunctionStepper';
import {StepLine} from './StepLine';

export type StepperLabels<X extends GenericKeyEnum> = Record<
  X,
  {
    title: string;
    helper?: string;
  }
>;

export const StepperModalProgress = <X extends GenericKeyEnum>({
  steps,
  labels,
}: {
  steps: StepsMap<X>;
  labels: StepperLabels<X>;
}) => {
  if (!steps) {
    return null;
  }

  return (
    <StepList>
      {Object.entries(steps).map(([id, step], i) => {
        return (
          <StepLine key={i} {...labels[id as X]} {...(step as StepData)} />
        );
      })}
    </StepList>
  );
};

const StepList = styled.div.attrs({
  className: 'flex flex-col gap-1',
})``;
