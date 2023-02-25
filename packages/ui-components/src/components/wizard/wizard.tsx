import React from 'react';
import styled from 'styled-components';
import {LinearProgress} from '../progress';

export type WizardProps = {
  title: string;
  description: string | React.ReactNode;
  includeStepper?: boolean;
  processName?: string;
  currentStep?: number;
  totalSteps?: number;
  nav: React.ReactNode;
};

export const Wizard: React.FC<WizardProps> = ({
  processName,
  currentStep,
  totalSteps,
  title,
  description,
  includeStepper = true,
  nav,
}) => {
  return (
    <StepCard data-testid="wizard">
      <div className="desktop:hidden">{nav}</div>

      {/* Stepper */}
      {includeStepper && (
        <Wrapper>
          <CenteredFlex>
            <p className="font-bold text-ui-800 desktop:text-primary-500">
              {processName}
            </p>
            <p className="text-ui-400">
              Step {currentStep} of {totalSteps}
            </p>
          </CenteredFlex>
          <LinearProgress max={totalSteps} value={currentStep} />
        </Wrapper>
      )}

      {/* Main */}
      <Wrapper>
        <StepTitle>{title}</StepTitle>
        <StepSubTitle>{description}</StepSubTitle>
      </Wrapper>
    </StepCard>
  );
};

const StepCard = styled.div.attrs({
  className:
    'flex flex-col px-2 pt-2 pb-3 tablet:p-3 desktop:p-6 tablet:rounded-xl gap-y-3 bg-ui-0 tablet:shadow-100',
})``;

const Wrapper = styled.div.attrs({
  className: 'space-y-1',
})``;

const StepTitle = styled.p.attrs({
  className: 'ft-text-3xl text-ui-800 font-bold',
})``;

const StepSubTitle = styled.span.attrs({
  className: 'text-ui-600 ft-text-lg',
})``;

const CenteredFlex = styled.div.attrs({
  className: 'flex justify-between text-sm desktop:text-base',
})``;
