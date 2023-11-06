import {useWatch} from 'react-hook-form';
import {MultisigEligibility} from '../../components/multisigEligibility';
import React from 'react';
import {SelectEligibility} from '../../components/selectEligibility';

const TokenProposalCreation = () => {
  const [isCustomToken, tokenType] = useWatch({
    name: ['isCustomToken', 'tokenType'],
  });
  if (
    !(
      isCustomToken ||
      tokenType === 'ERC-20' ||
      tokenType === 'governance-ERC20'
    )
  ) {
    return null;
  }
  return (
    <>
      <SelectEligibility />
    </>
  );
};

export const ProposalCreation = () => {
  const [membership] = useWatch({
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
