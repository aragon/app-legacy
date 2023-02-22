import React from 'react';
import styled from 'styled-components';

import {TableCell} from './tableCell';
import {Tag} from '../tag';
import {IconChevronDown} from '../icons';
import {Link} from '../link';
import {shortenAddress} from '../../utils/addresses';

export type VoterType = {
  wallet: string;
  option: 'yes' | 'abstain' | 'no' | 'approved' | 'none';
  votingPower?: string;
  tokenAmount?: string;
  voteReplaced?: boolean;
};

export type VotersTableProps = {
  voters: Array<VoterType>;
  page?: number;
  onLoadMore?: () => void;
  showOption?: boolean;
  showVotingPower?: boolean;
  showAmount?: boolean;
  pageSize?: number; // number of rows to show
};

const colorScheme = (option: string) =>
  option === 'yes' || option === 'approved'
    ? 'success'
    : option === 'no'
    ? 'critical'
    : 'neutral';

export const VotersTable: React.FC<VotersTableProps> = ({
  voters,
  onLoadMore,
  page = 1,
  showOption = false,
  showVotingPower = false,
  showAmount = false,
  pageSize = 3,
}) => {
  const displayedVoters = page * pageSize;

  return (
    <div className="overflow-x-auto">
      <Table data-testid="votersTable">
        <thead>
          <tr>
            <TableCell type="head" text="Wallet" className="w-1/2" />
            {showOption && <TableCell type="head" text="Option" />}
            {showOption && <TableCell type="head" />}
            {showVotingPower && (
              <TableCell
                type="head"
                text="Voting Power"
                className="text-center"
              />
            )}
            {showAmount && (
              <TableCell type="head" text="Token Amount" rightAligned />
            )}
          </tr>
        </thead>
        <tbody>
          {voters.slice(0, displayedVoters).map((voter, index) => (
            <tr key={index}>
              <TableCell type="text" text={shortenAddress(voter.wallet)} />
              {showOption && (
                <TableCell type="tag">
                  {voter.option && (
                    <span className="flex">
                      <Tag
                        label={voter.option}
                        className="capitalize"
                        colorScheme={colorScheme(voter.option)}
                      />
                    </span>
                  )}
                </TableCell>
              )}
              {showOption && voter.voteReplaced === true ? (
                <TableCell type="tag">
                  <span className="flex items-center -ml-2 text-xs text-ui-600">
                    Edited
                  </span>
                </TableCell>
              ) : (
                <TableCell type="text" />
              )}
              {showVotingPower && (
                <TableCell type="text" text={voter.votingPower} rightAligned />
              )}
              {showAmount && (
                <TableCell type="text" text={voter.tokenAmount} rightAligned />
              )}
            </tr>
          ))}
          {onLoadMore &&
            voters.length > pageSize &&
            displayedVoters < voters.length && (
              <tr>
                <TableCell type="link">
                  <Link
                    label="Load More"
                    iconRight={<IconChevronDown />}
                    onClick={onLoadMore}
                  />
                </TableCell>
                {showOption && <TableCell type="text" text="" />}
                {showVotingPower && <TableCell type="text" text="" />}
                {showAmount && <TableCell type="text" text="" />}
              </tr>
            )}
        </tbody>
      </Table>
    </div>
  );
};

export const Table = styled.table.attrs({
  className: 'w-full border-separate whitespace-nowrap',
})`
  border-spacing: 0;

  tr th,
  tr td {
    border-bottom: 1px solid #e4e7eb;
  }

  tr td:first-child {
    border-left: 1px solid #e4e7eb;
  }

  tr td:last-child {
    border-right: 1px solid #e4e7eb;
  }

  tr th {
    border-top: 1px solid #e4e7eb;
  }

  tr:first-child th:first-child {
    border-top-left-radius: 12px;
  }

  tr:first-child th:last-child {
    border-top-right-radius: 12px;
  }

  tr:last-child td:first-child {
    border-bottom-left-radius: 12px;
  }

  tr:last-child td:last-child {
    border-bottom-right-radius: 12px;
  }
`;
