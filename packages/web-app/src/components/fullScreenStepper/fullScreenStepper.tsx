import {
  IconChevronLeft,
  Wizard,
  ButtonText,
  IconChevronRight,
  Breadcrumb,
} from '@aragon/ui-components';
import React, {createContext, useContext, useEffect, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {StepProps} from './step';
import {useStepper} from 'hooks/useStepper';

export type FullScreenStepperProps = {
  navLabel: string;
  returnPath: string;
  wizardProcessName: string;
  children: React.FunctionComponentElement<StepProps>[];
};

type FullScreenStepperContextType = {
  currentStep: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  prev: () => void;
  next: () => void;
};

const FullScreenStepperContext = createContext<
  FullScreenStepperContextType | undefined
>(undefined);

export const useFormStep = () =>
  useContext(FullScreenStepperContext) as FullScreenStepperContextType;

export const FullScreenStepper: React.FC<FullScreenStepperProps> = ({
  wizardProcessName,
  children,
  navLabel,
  returnPath,
}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const {currentStep, prev, next, setStep} = useStepper(children.length);

  const currentIndex = currentStep - 1;
  const {
    includeStepper = true,
    wizardTitle,
    wizardDescription,
    hideWizard,
    fullWidth,
    customHeader,
    customFooter,
    backButtonLabel,
    nextButtonLabel,
    isNextButtonDisabled,
    onBackButtonClicked,
    onNextButtonClicked,
    onNextButtonDisabledClicked,
  } = children[currentIndex].props;

  const totalSteps = useMemo(() => {
    let total = 0;
    children.forEach((_, index) => {
      if (!children[index].props.hideWizard) total++;
    });
    return total;
  }, [children]);

  const previousHideWizards = useMemo(() => {
    let total = 0;
    for (let i = 0; i < currentStep; i++) {
      children[i].props.hideWizard && total++;
    }
    return total;
  }, [children, currentStep]);

  const value = {currentStep, setStep, prev, next};

  const currentFormStep = useMemo(() => {
    if (hideWizard) {
      return currentStep;
    } else {
      return currentStep - previousHideWizards;
    }
  }, [currentStep, hideWizard, previousHideWizards]);

  // Scroll Top each time the CurrentStep changed
  useEffect(() => {
    window.scrollTo({top: 0, behavior: 'smooth'});
  }, [currentStep]);

  return (
    <FullScreenStepperContext.Provider value={value}>
      <Layout>
        <div className="-mx-2 tablet:mx-0 tablet:mt-3">
          {!hideWizard && (
            <Wizard
              includeStepper={includeStepper}
              processName={wizardProcessName}
              title={wizardTitle || ''}
              description={wizardDescription || ''}
              totalSteps={totalSteps}
              currentStep={currentFormStep}
              renderHtml
              nav={
                <Breadcrumb
                  crumbs={{
                    label: navLabel,
                    path: returnPath,
                  }}
                  onClick={(path: string) => navigate(path)}
                />
              }
            />
          )}
          {customHeader}
        </div>
        <FormLayout fullWidth={fullWidth || false}>
          {children[currentIndex]}
          {customFooter ? (
            <>{customFooter}</>
          ) : (
            <FormFooter>
              <ButtonText
                mode="secondary"
                size="large"
                label={backButtonLabel || t('labels.back')}
                onClick={() =>
                  onBackButtonClicked ? onBackButtonClicked() : prev()
                }
                disabled={currentStep === 1}
                iconLeft={<IconChevronLeft />}
              />
              <ButtonValidationTrigger onClick={onNextButtonDisabledClicked}>
                <ButtonText
                  label={nextButtonLabel || t('labels.next')}
                  size="large"
                  onClick={() =>
                    onNextButtonClicked ? onNextButtonClicked(next) : next()
                  }
                  disabled={isNextButtonDisabled}
                  iconRight={<IconChevronRight />}
                />
              </ButtonValidationTrigger>
            </FormFooter>
          )}
        </FormLayout>
      </Layout>
    </FullScreenStepperContext.Provider>
  );
};

const Layout = styled.div.attrs({
  className:
    'col-span-full desktop:col-start-2 desktop:col-end-12 font-medium text-ui-600',
})``;

type FormLayoutProps = {
  fullWidth: boolean;
};

const FormLayout = styled.div.attrs(({fullWidth}: FormLayoutProps) => ({
  className: `mt-5 desktop:mt-8 mx-auto space-y-5 ${
    !fullWidth && 'desktop:w-3/5'
  }`,
}))<FormLayoutProps>``;

const FormFooter = styled.div.attrs({
  className: 'flex justify-between desktop:pt-3',
})``;

const ButtonValidationTrigger = styled.div``;
