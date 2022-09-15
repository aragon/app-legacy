import React from 'react';
import styled from 'styled-components';

import {TableCell} from './tableCell';
import {Badge} from '../badge';
import {IconChevronDown} from '../icons';
import {Link} from '../link';
import {shortenAddress} from '../../utils/addresses';

export type VoterType = {
  wallet: string;
  option: 'Yes' | 'Abstain' | 'No';
  votingPower?: string;
  tokenAmount?: string;
};

export type VotersTableProps = {
  voters: Array<VoterType>;
  onLoadMore?: () => void;
  showOption?: boolean;
  showVotingPower?: boolean;
  showAmount?: boolean;
  defaultRowCount?: number;
};

const colorScheme = (option: string) =>
  option === 'Yes' ? 'success' : option === 'No' ? 'critical' : 'neutral';

export const VotersTable: React.FC<VotersTableProps> = ({
  voters,
  onLoadMore,
  showOption = false,
  showVotingPower = false,
  showAmount = false,
  defaultRowCount = 3,
}) => {
  return (
    <Table data-testid="votersTable">
      <thead>
        <tr>
          <TableCell type="head" text="Wallet" />
          {showOption && <TableCell type="head" text="Option" />}
          {showVotingPower && <TableCell type="head" text="Voting Power" />}
          <TableCell type="head" text={showAmount ? 'Token Amount' : ''} />
        </tr>
      </thead>
      <tbody>
        {voters.map((voter, index) => (
          <tr key={index}>
            <TableCell type="text" text={shortenAddress(voter.wallet)} />
            {showOption && (
              <TableCell type="tag">
                {voter.option && (
                  <Badge
                    label={voter.option}
                    colorScheme={colorScheme(voter.option)}
                  />
                )}
              </TableCell>
            )}
            {showVotingPower && (
              <TableCell type="text" text={voter.votingPower} rightAligned />
            )}
            <TableCell
              type="text"
              text={showAmount ? voter.tokenAmount : ''}
              rightAligned
            />
          </tr>
        ))}
      </tbody>
      <tfoot>
        {onLoadMore && voters.length > defaultRowCount && (
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
            <TableCell type="text" text="" />
          </tr>
        )}
      </tfoot>
    </Table>
  );
};

export const Table = styled.table.attrs({
  className: 'border-separate block overflow-auto whitespace-nowrap',
})`
  border-spacing: 0;

  th,
  td {
    width: 100%;
  }

  tr th,
  tr td {
    border-bottom: 1px solid #e4e7eb;
  }

  tr th:first-child {
    border-left: 1px solid #e4e7eb;
  }

  tr th:last-child {
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

  tfoot td:first-child {
    border-bottom-left-radius: 12px;
  }

  tfoot td:last-child {
    border-bottom-right-radius: 12px;
  }
`;
