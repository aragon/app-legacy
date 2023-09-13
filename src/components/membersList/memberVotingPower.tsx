import React from 'react';
import {abbreviateTokenAmount} from 'utils/tokens';

export type MemberVotingPowerProps = {
  votingPower?: number;
  tokenSymbol?: string;
  tokenSupply?: number;
};

export const MemberVotingPower: React.FC<MemberVotingPowerProps> = props => {
  const {votingPower, tokenSymbol, tokenSupply} = props;

  const supplyPercentage =
    tokenSupply && votingPower != null
      ? ((votingPower / tokenSupply) * 100).toFixed(2)
      : undefined;

  const parsedVotingPower = abbreviateTokenAmount(
    votingPower?.toString() ?? '0'
  );

  if ((votingPower ?? 0) <= 0) {
    return null;
  }

  return (
    <div className="flex flex-row gap-0.5 items-center">
      <div className="flex flex-row gap-0.25 font-semibold ft-text-sm">
        <span>{parsedVotingPower}</span>
        <span>{tokenSymbol}</span>
      </div>
      <span className="ft-text-xs">({supplyPercentage}%)</span>
    </div>
  );
};
