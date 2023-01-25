import {
  ButtonGroup,
  ButtonText,
  IconAdd,
  Link,
  Option,
  Pagination,
} from '@aragon/ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import ProposalList from 'components/proposalList';
import {Loading} from 'components/temporary';
import {PageWrapper} from 'components/wrappers';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {PluginTypes} from 'hooks/usePluginClient';
import {ProposalListItem, useProposals} from 'hooks/useProposals';
import NoProposals from 'public/noProposals.svg';
import {erc20VotingProposals_erc20VotingProposals} from 'queries/__generated__/erc20VotingProposals';
import {trackEvent} from 'services/analytics';

const Governance: React.FC = () => {
  const {data: dao, isLoading} = useDaoParam();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetails(dao!);

  const {data: proposals, isLoading: proposalsAreLoading} = useProposals(
    daoDetails?.address as string,
    daoDetails?.plugins[0].id as PluginTypes
  );

  const {t} = useTranslation();
  const navigate = useNavigate();
  const [filterValue, setFilterValue] = useState<string>('all');

  // The number of proposals displayed on each page
  const ProposalsPerPage = 6;
  const [page, setPage] = useState(1);

  const activeProposalCount = proposals?.filter(
    proposal => proposal.status.toLowerCase() === 'active'
  ).length;

  let displayedProposals: Array<ProposalListItem> = [];

  if (proposals && proposals.length > 0 && filterValue) {
    displayedProposals = proposals.filter(
      t => t.status.toLowerCase() === filterValue || filterValue === 'all'
    );
  }

  if (proposalsAreLoading || detailsAreLoading || isLoading) {
    return <Loading />;
  }

  if (!proposals || proposals.length === 0) {
    return (
      <>
        <Container>
          <EmptyStateContainer>
            <ImageContainer src={NoProposals} />
            <EmptyStateHeading>
              {t('governance.emptyState.title')}
            </EmptyStateHeading>
            <span className="mt-1.5 lg:w-1/2 text-center">
              {t('governance.emptyState.subtitleLine1')}{' '}
              {t('governance.emptyState.subtitleLine2')}{' '}
              <Link
                label={t('governance.emptyState.proposalGuide')}
                href="https://aragon.org/how-to/structure-dao-proposals-and-build-proposal-processes"
              />
            </span>
            <ButtonText
              size="large"
              label="New Proposal"
              iconLeft={<IconAdd />}
              className="mt-4"
              onClick={() => {
                trackEvent('governance_newProposalBtn_clicked', {
                  dao_address: dao,
                });
                navigate('new-proposal');
              }}
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
        description={
          activeProposalCount === 1
            ? t('governance.subtitleSingular')
            : t('governance.subtitle', {activeProposalCount})
        }
        primaryBtnProps={{
          label: t('governance.action'),
          iconLeft: <IconAdd />,
          onClick: () => {
            trackEvent('governance_newProposalBtn_clicked', {
              dao_address: dao,
            });
            navigate('new-proposal');
          },
        }}
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

export const Container = styled.div.attrs({
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

export const EmptyStateContainer = styled.div.attrs({
  className:
    'flex flex-col w-full items-center py-4 px-3 tablet:py-12 tablet:px-6 mx-auto mt-3 tablet:mt-5 text-lg bg-white rounded-xl text-ui-500',
})``;

const ImageContainer = styled.img.attrs({
  className: 'object-cover w-1/2',
})``;

export const EmptyStateHeading = styled.h1.attrs({
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
