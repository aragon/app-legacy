import React from 'react';
import {
  IconRadioCancel,
  IconRadioDefault,
  IconSuccess,
  Spinner,
} from '@aragon/ods-old';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {
  GenericKeyEnum,
  StepData,
  StepsMap,
  StepStatus,
} from '../../hooks/useFunctionStepper';

export type StepperLabels<X extends GenericKeyEnum> = Record<
  X,
  {
    title: string;
    helper?: string;
  }
>;

const icons = {
  [StepStatus.WAITING]: <IconRadioDefault className="text-ui-200" />,
  [StepStatus.LOADING]: <Spinner size="xs" />,
  [StepStatus.SUCCESS]: <IconSuccess className="text-success-500" />,
  [StepStatus.ERROR]: <IconRadioCancel className="text-critical-700" />,
};

const textColor = {
  [StepStatus.WAITING]: 'text-ui-400',
  [StepStatus.LOADING]: 'text-primary-400',
  [StepStatus.SUCCESS]: 'text-success-600',
  [StepStatus.ERROR]: 'text-critical-700',
};

const StepLine = ({
  status,
  title,
  helper,
}: {title: string; helper?: string} & StepData) => {
  const {t, i18n} = useTranslation();

  return (
    <StepListItem>
      <IconAndMessage>
        {icons[status]}
        <div className={textColor[status]}>{title}</div>
      </IconAndMessage>
      {status === StepStatus.ERROR && (
        <div className={'text-critical-800 ft-text-sm'}>
          {t('stepperModal.stepError')}
        </div>
      )}
      {helper && status === StepStatus.LOADING && (
        <div className={'text-neutral-400 ft-text-sm'}>{helper}</div>
      )}
    </StepListItem>
  );
};

const StepperModalProgress = <X extends GenericKeyEnum>({
  steps,
  labels,
}: {
  steps: StepsMap<X>;
  labels: StepperLabels<X>;
}) => {
  const {t, i18n} = useTranslation();

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

const StepListItem = styled.div.attrs({
  className: 'flex justify-between text-neutral-600',
})``;

const IconAndMessage = styled.div.attrs({
  className: 'flex space-x-2 items-center',
})``;

export default StepperModalProgress;
