import React from 'react';
import {styled} from 'styled-components';
import {LinearProgress} from '../progress';

export type WizardProps = {
  title: string;
  description: string | React.ReactNode;
  includeStepper?: boolean;
  processName?: string;
  currentStep?: number;
  totalSteps?: number;
  nav: React.ReactNode;
  renderHtml?: boolean;
};

export const Wizard: React.FC<WizardProps> = ({
  processName,
  currentStep,
  totalSteps,
  title,
  description,
  includeStepper = true,
  nav,
  renderHtml,
}) => {
  return (
    <StepCard data-testid="wizard">
      <div className="xl:hidden">{nav}</div>

      {/* Stepper */}
      {includeStepper && (
        <Wrapper>
          <CenteredFlex>
            <p className="font-semibold text-neutral-800 xl:text-primary-500">
              {processName}
            </p>
            <p className="text-neutral-400">
              Step {currentStep} of {totalSteps}
            </p>
          </CenteredFlex>
          <LinearProgress max={totalSteps} value={currentStep} />
        </Wrapper>
      )}

      {/* Main */}
      <Wrapper>
        <StepTitle>{title}</StepTitle>
        {renderHtml ? (
          <StepSubTitle
            dangerouslySetInnerHTML={{__html: description as string}}
          />
        ) : (
          <StepSubTitle>{description}</StepSubTitle>
        )}
      </Wrapper>
    </StepCard>
  );
};

const StepCard = styled.div.attrs({
  className:
    'flex flex-col px-2 pt-2 pb-3 md:p-3 xl:p-6 md:rounded-xl gap-y-3 bg-neutral-0 md:shadow-100',
})``;

const Wrapper = styled.div.attrs({
  className: 'space-y-1',
})``;

const StepTitle = styled.p.attrs({
  className: 'ft-text-3xl text-neutral-800 font-semibold',
})``;

const StepSubTitle = styled.span.attrs({
  className: 'text-neutral-600 ft-text-lg',
})`
  & > a {
    color: #003bf5;
    font-weight: 700;
  }
`;

const CenteredFlex = styled.div.attrs({
  className: 'flex justify-between text-sm xl:text-base',
})``;
