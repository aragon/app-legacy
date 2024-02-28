import React from 'react';
import {styled} from 'styled-components';
import {shortenAddress} from '../../utils';
import {ListItemVoter} from '../listItem/voter';
import {Icon, IconType} from '@aragon/ods';

export type VoterType = {
  wallet: string;
  src: string;
  option: 'yes' | 'abstain' | 'no' | 'approved' | 'none';
  votingPower?: string;
  tokenAmount?: string | number;
  tokenSymbol?: string;
  voteReplaced?: boolean;
  walletTag?: 'You' | 'Your delegate';
};

export type VotersTableProps = {
  voters: VoterType[];
  onVoterClick?: (address: string) => void;
  page?: number;
  LoadMoreLabel: string;
  onLoadMore?: () => void;
  showOption?: boolean;
  showAmount?: boolean;
  pageSize?: number; // number of rows to show
};

const colorScheme = (option: VoterType['walletTag']) =>
  option === 'You' ? 'neutral' : 'info';

export const VotersTable: React.FC<VotersTableProps> = ({
  voters,
  onVoterClick = () => {},
  LoadMoreLabel,
  onLoadMore,
  page = 1,
  showAmount = false,
  pageSize = 3,
}) => {
  const displayedVoters = page * pageSize;

  return (
    <Container data-testid="votersTable">
      {voters.slice(0, displayedVoters).map((voter, index) => (
        <ListItemVoter
          key={index}
          label={shortenAddress(voter.wallet)}
          src={voter.src}
          option={voter.option}
          onClick={() => onVoterClick(voter.wallet)}
          voteReplaced={voter.voteReplaced}
          {...(voter.walletTag && {
            walletTag: {
              colorScheme: colorScheme(voter.walletTag),
              label: voter.walletTag || '',
            },
          })}
          {...(showAmount && {
            tokenInfo: {
              amount: voter.tokenAmount as string,
              symbol: voter.tokenSymbol as string,
            },
          })}
        />
      ))}
      {onLoadMore &&
        voters.length > pageSize &&
        displayedVoters < voters.length && (
          <LoadMoreContainer onClick={onLoadMore}>
            <Link>
              <LinkLabel>{LoadMoreLabel}</LinkLabel>
              <Icon icon={IconType.CHEVRON_DOWN} />
            </Link>
          </LoadMoreContainer>
        )}
    </Container>
  );
};

const Container = styled.div.attrs({
  className: 'w-full border-2 border-neutral-100 rounded-xl whitespace-nowrap',
})`
  button:first-child {
    border-top-right-radius: 12px;
    border-top-left-radius: 12px;
  }

  button:last-child {
    border-bottom-right-radius: 12px;
    border-bottom-left-radius: 12px;
    border-bottom-width: 0;
  }
`;

const LoadMoreContainer = styled.button.attrs({
  className: 'px-4 py-3',
})``;

const Link = styled.a.attrs({
  className: 'flex items-center min-w-0 text-primary-500 space-x-3',
})``;

const LinkLabel = styled.p.attrs({
  className: 'font-semibold',
})``;
