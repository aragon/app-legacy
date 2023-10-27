import {useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import useScreen from '../../hooks/useScreen';
import {MultisigEligibility} from '../../components/multisigEligibility';
import React from 'react';
import {Label} from '@aragon/ods-old';
import {SelectEligibility} from '../../components/selectEligibility';
import styled from 'styled-components';

const TokenProposalCreation = () => {
  const [isCustomToken, tokenType] = useWatch({
    name: ['isCustomToken', 'tokenType'],
  });
  const {t} = useTranslation();
  const isAllowedToConfigureVotingEligibility =
    isCustomToken || tokenType === 'ERC-20' || tokenType === 'governance-ERC20';
  return (
    <>
      {isAllowedToConfigureVotingEligibility && (
        <>
          <SelectEligibility />
        </>
      )}
    </>
  );
};

export const ProposalCreation = () => {
  const {control} = useFormContext();
  const {t} = useTranslation();
  const {isMobile} = useScreen();
  const [membership, isCustomToken] = useWatch({
    name: ['membership', 'isCustomToken'],
  });

  return (
    <div>
      {membership === 'multisig' && (
        <>
          <MultisigEligibility />
        </>
      )}
      {membership === 'token' && (
        <>
          <TokenProposalCreation />
        </>
      )}
    </div>
  );
};

const DescriptionContainer = styled.div.attrs({
  className: 'space-y-0.5',
})``;
