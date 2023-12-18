import React, {useState} from 'react';
import {ProposalBase} from '@aragon/sdk-client-common';
import {ButtonText, IconChevronDown, IconChevronRight} from '@aragon/ods-old';
import {Link, generatePath, useParams} from 'react-router-dom';
import {Proposal} from 'utils/paths';
import {useTranslation} from 'react-i18next';
import {Locale, formatDistanceToNow} from 'date-fns';
import * as Locales from 'date-fns/locale';
import {useNetwork} from 'context/network';
import {EmptyMemberSection} from 'pages/daoMember';

export interface IUserProposalListProps {
  proposals?: ProposalBase[];
}

export const UserProposalList: React.FC<IUserProposalListProps> = props => {
  const {proposals = []} = props;

  const {t, i18n} = useTranslation();
  const {network} = useNetwork();
  const {dao} = useParams();

  const [page, setPage] = useState(0);

  const filteredProposals = proposals.slice(0, page === 0 ? 2 : page * 6 + 2);
  const hasMore = filteredProposals.length < proposals.length;

  const getRelativeDate = (date: Date) => {
    const locale = (Locales as Record<string, Locale>)[i18n.language];
    const timeUntilNow = formatDistanceToNow(date, {locale});

    return timeUntilNow;
  };

  const buildProposalPath = (id: string) =>
    generatePath(Proposal, {
      network,
      dao,
      id,
    });

  if (proposals.length === 0) {
    return (
      <EmptyMemberSection
        title={t('members.profile.emptyState.ProposalsCreated')}
        illustration="not_found"
      />
    );
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex w-full flex-col gap-2">
        {filteredProposals.map(proposal => (
          <Link
            className="flex grow flex-row items-center gap-4 rounded-xl border border-neutral-100 bg-neutral-0 px-6 py-5"
            key={proposal.id}
            to={buildProposalPath(proposal.id)}
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
                {getRelativeDate(proposal.creationDate)} ago
              </p>
            </div>
            <IconChevronRight className="shrink-0 text-neutral-300" />
          </Link>
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
