import React, {useState} from 'react';
import {ButtonText, IconChevronDown} from '@aragon/ods-old';
import {generatePath, useParams} from 'react-router-dom';
import {Proposal} from 'utils/paths';
import {useTranslation} from 'react-i18next';
import {useNetwork} from 'context/network';
import {EmptyMemberSection, MemberSection} from 'pages/daoMember';
import {MemberDAOsType} from 'utils/types';
import {ActionItemMembership} from 'components/membersList/actionItemMembership';

export interface IMembershipDAOListProps {
  daos: MemberDAOsType;
}

const initialDAOsPageSize = 3;
const daosPageSize = 6;

export const MembershipDAOList: React.FC<IMembershipDAOListProps> = ({
  daos,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  const [page, setPage] = useState(0);

  const filteredProposals = daos.slice(
    0,
    page === 0 ? initialDAOsPageSize : page * daosPageSize + initialDAOsPageSize
  );
  const hasMore = filteredProposals.length < daos.length;

  // const getRelativeDate = (date: Date) => {
  //   const locale = (Locales as Record<string, Locale>)[i18n.language];
  //   const timeUntilNow = formatDistanceToNow(date, {locale});

  //   return timeUntilNow;
  // };

  const handleDaoClicked = (dao: string, chain: SupportedChainID) => {
    navigate(
      generatePath(Dashboard, {
        network: getSupportedNetworkByChainId(chain),
        dao,
      })
    );
  };

  if (daos.length === 0) {
    return (
      <EmptyMemberSection
        title={t('members.profile.emptyState.Memberships')}
        illustration="users"
      />
    );
  }

  return (
    <MemberSection
      title={t('members.profile.sectionProposalsCreated', {
        amount: daos.length,
      })}
    >
      <div className="flex flex-col items-start gap-3">
        <div className="flex w-full flex-col gap-2">
          {daos?.map((dao, index) => (
            <ActionItemMembership
              key={index}
              address={dao.address}
              subdomain={dao.subdomain}
              metadata={dao.metadata}
            />
          ))}
        </div>
        {hasMore && (
          <ButtonText
            mode="secondary"
            label={t('members.profile.labelViewMore')}
            className="border-neutral-100"
            iconRight={<IconChevronDown />}
            onClick={() => setPage(current => current + 1)}
          />
        )}
      </div>
    </MemberSection>
  );
};
