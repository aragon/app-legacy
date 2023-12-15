import React, {useState} from 'react';
import {ProposalBase} from '@aragon/sdk-client-common';
import {ButtonText, IconChevronDown, IconChevronRight} from '@aragon/ods-old';

export interface IUserProposalListProps {
  proposals?: ProposalBase[];
}

export const UserProposalList: React.FC<IUserProposalListProps> = props => {
  const {proposals = []} = props;

  const [page, setPage] = useState(0);

  const filteredProposals = proposals.slice(0, page === 0 ? 2 : page * 6 + 2);

  const hasMore = filteredProposals.length < proposals.length;

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex w-full flex-col gap-2">
        {filteredProposals.map(proposal => (
          <div
            className="flex grow flex-row items-center gap-4 rounded-xl border border-neutral-100 bg-neutral-0 px-6 py-5"
            key={proposal.id}
          >
            <div className="flex grow flex-col gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-neutral-800 ft-text-lg">
                  {proposal.metadata.title}
                </p>
                <p className="line-clamp-3 text-neutral-600 ft-text-base">
                  {proposal.metadata.summary}
                </p>
              </div>
              <p className="text-neutral-500 ft-text-base">
                {proposal.creationDate.getDate()}
              </p>
            </div>
            <IconChevronRight className="shrink-0 text-neutral-300" />
          </div>
        ))}
      </div>
      {hasMore && (
        <ButtonText
          mode="secondary"
          label="View more"
          iconRight={<IconChevronDown />}
          onClick={() => setPage(current => current + 1)}
        />
      )}
    </div>
  );
};
