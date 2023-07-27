import {Label} from '@aragon/ods';
import React from 'react';
import {useWatch} from 'react-hook-form';
import styled from 'styled-components';

const ConfirmDaoCreation: React.FC = () => {
  const [
    blockchain,
    daoLogo,
    daoName,
    daoEnsName,
    daoSummary,
    tokenName,
    tokenSymbol,
    tokenDecimals,
    tokenTotalSupply,
    tokenTotalHolders,
    tokenType,
    isCustomToken,
    links,
    wallets,
    committee,
    committeeMinimumApproval,
    tokenAddress,
    durationMinutes,
    durationHours,
    durationDays,
    minimumApproval,
    minimumParticipation,
    eligibilityType,
    eligibilityTokenAmount,
    support,
    membership,
    earlyExecution,
    voteReplacement,
    multisigWallets,
    multisigMinimumApprovals,
    votingType,
    executionExpirationMinutes,
    executionExpirationHours,
    executionExpirationDays,
  ] = useWatch({
    name: [
      'blockchain',
      'daoLogo',
      'daoName',
      'daoEnsName',
      'daoSummary',
      'tokenName',
      'tokenSymbol',
      'tokenDecimals',
      'tokenTotalSupply',
      'tokenTotalHolders',
      'tokenType',
      'isCustomToken',
      'links',
      'wallets',
      'committee',
      'committeeMinimumApproval',
      'tokenAddress',
      'durationMinutes',
      'durationHours',
      'durationDays',
      'minimumApproval',
      'minimumParticipation',
      'eligibilityType',
      'eligibilityTokenAmount',
      'support',
      'membership',
      'earlyExecution',
      'voteReplacement',
      'multisigWallets',
      'multisigMinimumApprovals',
      'votingType',
      'executionExpirationMinutes',
      'executionExpirationHours',
      'executionExpirationDays',
    ],
  });

  return (
    <>
      <FormItem>
        <Label label={'All data'} />
        blockchain: {blockchain?.toString()} <br />
        daoLogo: {daoLogo?.toString()} <br />
        daoName: {daoName?.toString()} <br />
        daoEnsName: {daoEnsName?.toString()} <br />
        daoSummary: {daoSummary?.toString()} <br />
        tokenName: {tokenName?.toString()} <br />
        tokenSymbol: {tokenSymbol?.toString()} <br />
        tokenDecimals: {tokenDecimals?.toString()} <br />
        tokenTotalSupply: {tokenTotalSupply?.toString()} <br />
        tokenTotalHolders: {tokenTotalHolders?.toString()} <br />
        tokenType: {tokenType?.toString()} <br />
        isCustomToken: {isCustomToken?.toString()} <br />
        links: {links?.toString()} <br />
        wallets: {wallets?.toString()} <br />
        committee: {committee?.toString()} <br />
        committeeMinimumApproval: {committeeMinimumApproval?.toString()} <br />
        tokenAddress: {tokenAddress?.toString()} <br />
        durationMinutes: {durationMinutes?.toString()} <br />
        durationHours: {durationHours?.toString()} <br />
        durationDays: {durationDays?.toString()} <br />
        minimumApproval: {minimumApproval?.toString()} <br />
        minimumParticipation: {minimumParticipation?.toString()} <br />
        eligibilityType: {eligibilityType?.toString()} <br />
        eligibilityTokenAmount: {eligibilityTokenAmount?.toString()} <br />
        support: {support?.toString()} <br />
        membership: {membership?.toString()} <br />
        earlyExecution: {earlyExecution?.toString()} <br />
        voteReplacement: {voteReplacement?.toString()} <br />
        multisigWallets: {multisigWallets?.toString()} <br />
        multisigMinimumApprovals: {multisigMinimumApprovals?.toString()} <br />
        votingType: {votingType?.toString()} <br />
        executionExpirationMinutes: {executionExpirationMinutes?.toString()}
        <br />
        executionExpirationHours: {executionExpirationHours?.toString()} <br />
        executionExpirationDays: {executionExpirationDays?.toString()} <br />
      </FormItem>
    </>
  );
};

export default ConfirmDaoCreation;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;
