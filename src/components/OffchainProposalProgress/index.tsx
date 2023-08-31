import React, {useCallback, useMemo, useState} from 'react';
import {
  IconRadioCancel,
  IconRadioDefault,
  IconReload,
  IconSuccess,
  Spinner,
} from '@aragon/ods';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {
  OffchainProposalSteps,
  StepData,
  OffchainProposalStepId,
  StepStatus,
} from '../../context/createOffchainProposal';

const icons = {
  [StepStatus.WAITING]: <IconRadioDefault className="text-ui-200" />,
  [StepStatus.LOADING]: <Spinner size="xs" />,
  [StepStatus.SUCCESS]: <IconSuccess className="text-success-500" />,
  [StepStatus.ERROR]: <IconRadioCancel className="text-red-700" />,
};

const textColor = {
  [StepStatus.WAITING]: 'text-ui-400',
  [StepStatus.LOADING]: 'text-primary-400',
  [StepStatus.SUCCESS]: 'text-success-600',
  [StepStatus.ERROR]: 'text-red-700',
};

type Labels = {
  [key in OffchainProposalStepId]: {
    title: string;
    helper?: string;
  };
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
        <div className={'text-ui-400 ft-text-sm'}>
          {t('offChainProposalCreation.stepError.helper')}
        </div>
      )}
      {helper && status === StepStatus.LOADING && (
        <div className={'text-ui-400 ft-text-sm'}>{helper}</div>
      )}
    </StepListItem>
  );
};

const OffchainProposalProgress = ({steps}: {steps: OffchainProposalSteps}) => {
  const {t, i18n} = useTranslation();

  if (!steps) {
    return null;
  }

  const labels: Labels = {
    REGISTER_VOCDONI_ACCOUNT: {
      title: t('offChainProposalCreation.createVocdoniAccount.title'),
      helper: t('offChainProposalCreation.createVocdoniAccount.helper'),
    },
    CREATE_VOCDONI_ELECTION: {
      title: t('offChainProposalCreation.createVocdoniElection.title'),
      helper: t('offChainProposalCreation.createVocdoniElection.helper'),
    },
    CREATE_ONCHAIN_PROPOSAL: {
      title: t('offChainProposalCreation.createOnChainProposal.title'),
      helper: t('offChainProposalCreation.createOnChainProposal.helper'),
    },
    PROPOSAL_IS_READY: {
      title: t('offChainProposalCreation.proposalReady.title'),
    },
  };

  return (
    <StepList>
      {Object.entries(steps).map(([id, step], i) => {
        return (
          <StepLine
            key={i}
            {...labels[id as OffchainProposalStepId]}
            {...step}
          />
        );
      })}
    </StepList>
  );
};

const StepList = styled.div.attrs({
  className: 'flex flex-col gap-1',
})``;

const StepListItem = styled.div.attrs({
  className: 'flex justify-between text-ui-600',
})``;

const IconAndMessage = styled.div.attrs({
  className: 'flex space-x-2 items-center',
})``;

export default OffchainProposalProgress;
