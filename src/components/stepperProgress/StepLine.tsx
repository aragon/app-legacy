import React from 'react';
import styled from 'styled-components';

import {Spinner} from '../../@aragon/ods-old';
import {Icon, IconType} from '@aragon/ods';
import {StepData, StepStatus} from '../../hooks/useFunctionStepper';

const icons = {
  [StepStatus.WAITING]: (
    <Icon icon={IconType.RADIO_DEFAULT} className="text-neutral-200" />
  ),
  [StepStatus.LOADING]: <Spinner size="xs" />,
  [StepStatus.SUCCESS]: (
    <Icon icon={IconType.RADIO_CHECK} className="text-success-500" />
  ),
  [StepStatus.ERROR]: (
    <Icon icon={IconType.RADIO_CANCEL} className="text-critical-700" />
  ),
};

const textColor = {
  [StepStatus.WAITING]: 'text-neutral-400',
  [StepStatus.LOADING]: 'text-primary-400',
  [StepStatus.SUCCESS]: 'text-success-600',
  [StepStatus.ERROR]: 'text-critical-700',
};

export const StepLine = ({
  status,
  title,
  helper,
}: {title: string; helper?: string} & StepData) => {
  return (
    <StepListItem>
      <IconAndMessage>
        {icons[status]}
        <div className={textColor[status]}>{title}</div>
      </IconAndMessage>
      {helper && status === StepStatus.LOADING && (
        <div className={'text-neutral-400 ft-text-sm'}>{helper}</div>
      )}
    </StepListItem>
  );
};

const StepListItem = styled.div.attrs({
  className: 'flex justify-between text-neutral-600',
})``;

const IconAndMessage = styled.div.attrs({
  className: 'flex space-x-2 items-center',
})``;
