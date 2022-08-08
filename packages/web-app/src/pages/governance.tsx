import React, {useState} from 'react';
import {withTransaction} from '@elastic/apm-rum-react';
import {
  Option,
  ButtonGroup,
  Pagination,
  ButtonText,
  IconAdd,
  Link,
} from '@aragon/ui-components';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {useQuery} from '@apollo/client';

import {PageWrapper} from 'components/wrappers';
import ProposalList from 'components/proposalList';
import NoProposals from 'public/noProposals.svg';
import {ERC20VOTING_PROPOSAL_LIST} from 'queries/proposals';
import {
  erc20VotingProposals,
  erc20VotingProposals_erc20VotingProposals,
} from 'queries/__generated__/erc20VotingProposals';
import {useDaoParam} from 'hooks/useDaoParam';
import {Loading} from 'components/temporary';

const Governance: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const [filterValue, setFilterValue] = useState<string>('all');
  const {data: daoId, loading: daoIdLoading, error: daoIdError} = useDaoParam();
  const {
    data: uncategorizedDaoProposals,
    loading: proposalsLoading,
    error: proposalsError,
  } = useQuery<erc20VotingProposals>(ERC20VOTING_PROPOSAL_LIST, {
    variables: {dao: daoId},
  });

  // The number of proposals displayed on each page
  const ProposalsPerPage = 6;
  const [page, setPage] = useState(1);

  const daoProposals = uncategorizedDaoProposals?.erc20VotingProposals
    // As of this commit, vote data is not available. Simply delete the first
    // mapping once they are. [VR 13-07-2022]
    .map(p => ({
      ...p,
      yea: Math.floor(Math.random() * 100),
      nay: Math.floor(Math.random() * 100),
    }))
    .map(categorizeProposal);

  const activeProposalCount = daoProposals?.filter(
    proposal => proposal.type === 'active'
  ).length;

  let displayedProposals: CategorizedProposal[] = [];
  if (daoProposals && daoProposals.length > 0 && filterValue) {
    displayedProposals = daoProposals.filter(
      t => t.type === filterValue || filterValue === 'all'
    );
  }

  if (proposalsLoading || daoIdLoading) {
    return <Loading />;
  }

  if (proposalsError || daoIdError) {
    return <p>Error. Check console</p>;
  }

  if (!daoProposals || daoProposals.length === 0) {
    return (
      <>
        <Container>
          <EmptyStateContainer>
            <ImageContainer src={NoProposals} />
            <EmptyStateHeading>
              {t('governance.emptyState.title')}
            </EmptyStateHeading>

            <p className="mt-1.5 lg:w-1/2 text-center">
              {t('governance.emptyState.subtitleLine1')}{' '}
              {t('governance.emptyState.subtitleLine2')}{' '}
              <Link label={t('governance.emptyState.proposalGuide')} />
            </p>
            <ButtonText
              size="large"
              label="New Proposal"
              iconLeft={<IconAdd />}
              className="mt-4"
              onClick={() => navigate('new-proposal')}
            />
          </EmptyStateContainer>
        </Container>
      </>
    );
  }

  return (
    <>
      <PageWrapper
        title={'Proposals'}
        buttonLabel={'New Proposal'}
        subtitle={`${activeProposalCount} active proposal${
          activeProposalCount !== 1 ? 's' : ''
        }`}
        onClick={() => navigate('new-proposal')}
      >
        <ButtonGroupContainer>
          <ButtonGroup
            bgWhite
            defaultValue="all"
            onChange={(selected: string) => {
              setFilterValue(selected);
              setPage(1);
            }}
          >
            <Option value="all" label="All" />
            <Option value="pending" label="Pending" />
            <Option value="active" label="Active" />
            <Option value="succeeded" label="Succeeded" />
            <Option value="executed" label="Executed" />
            <Option value="defeated" label="Defeated" />
          </ButtonGroup>
        </ButtonGroupContainer>
        <ListWrapper>
          <ProposalList
            proposals={displayedProposals.slice(
              (page - 1) * ProposalsPerPage,
              page * ProposalsPerPage
            )}
          />
        </ListWrapper>
        <PaginationWrapper>
          {displayedProposals.length > ProposalsPerPage && (
            <Pagination
              totalPages={
                Math.ceil(
                  displayedProposals.length / ProposalsPerPage
                ) as number
              }
              activePage={page}
              onChange={(activePage: number) => {
                setPage(activePage);
                window.scrollTo({top: 0, behavior: 'smooth'});
              }}
            />
          )}
        </PaginationWrapper>
      </PageWrapper>
    </>
  );
};

export default withTransaction('Governance', 'component')(Governance);

const Container = styled.div.attrs({
  className: 'col-span-full desktop:col-start-3 desktop:col-end-11',
})``;

const ButtonGroupContainer = styled.div.attrs({
  className: 'flex overflow-auto mt-3 desktop:mt-8',
})`
  scrollbar-width: none;

  ::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }
`;

const ListWrapper = styled.div.attrs({
  className: 'mt-3',
})``;

const PaginationWrapper = styled.div.attrs({
  className: 'flex mt-8',
})``;

const EmptyStateContainer = styled.div.attrs({
  className:
    'flex flex-col w-full items-center py-4 px-3 tablet:py-8 tablet:px-6 mx-auto mt-3 tablet:mt-5 text-lg bg-white rounded-xl text-ui-500',
})``;

const ImageContainer = styled.img.attrs({
  className: 'object-cover w-1/2',
})``;

const EmptyStateHeading = styled.h1.attrs({
  className: 'mt-4 text-2xl font-bold text-ui-800 text-center',
})``;

export interface CategorizedProposal
  extends erc20VotingProposals_erc20VotingProposals {
  type: 'draft' | 'pending' | 'active' | 'succeeded' | 'executed' | 'defeated';
}

/**
 * Takes and uncategorized proposal and categorizes it according to definitions.
 * @param uncategorizedProposal
 * @returns categorized proposal (i.e., uncategorizedProposal with additional
 * type field)
 */
export function categorizeProposal(
  uncategorizedProposal: erc20VotingProposals_erc20VotingProposals
): CategorizedProposal {
  const now = Date.now();
  //onchain data coming in as seconds. Convert to milliseconds to compare with now.
  const start =
    Number.parseInt(uncategorizedProposal.startDate as string) * 1000;
  const end = Number.parseInt(uncategorizedProposal.endDate as string) * 1000;

  if (start >= now) {
    return {
      ...uncategorizedProposal,
      type: 'pending',
    };
  } else if (end >= now) {
    return {
      ...uncategorizedProposal,
      type: 'active',
    };
  } else if (uncategorizedProposal.executed) {
    return {
      ...uncategorizedProposal,
      type: 'executed',
    };
  } else if (uncategorizedProposal.yea > uncategorizedProposal.nay) {
    return {
      ...uncategorizedProposal,
      type: 'succeeded',
    };
  } else {
    return {
      ...uncategorizedProposal,
      type: 'defeated',
    };
  }
}
