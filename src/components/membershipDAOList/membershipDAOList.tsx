import React, {useState} from 'react';
import {ButtonText, IconChevronDown} from '@aragon/ods-old';
import {useTranslation} from 'react-i18next';
import {EmptyMemberSection, MemberSection} from 'pages/daoMember';
import {MemberDAOsType} from 'utils/types';
import {ActionItemMembership} from 'components/membersList/actionItemMembership';

export interface IMembershipDAOListProps {
  daos?: MemberDAOsType;
  memberAddress: string;
}

const initialDAOsPageSize = 3;
const daosPageSize = 6;

export const MembershipDAOList: React.FC<IMembershipDAOListProps> = ({
  daos,
  memberAddress,
}) => {
  const {t} = useTranslation();

  const [page, setPage] = useState(0);

  const filteredDaos = daos?.slice(
    0,
    page === 0 ? initialDAOsPageSize : page * daosPageSize + initialDAOsPageSize
  );
  const hasMore =
    filteredDaos && daos ? filteredDaos?.length < daos?.length : false;

  if (daos?.length === 0) {
    return (
      <EmptyMemberSection
        title={t('members.profile.emptyState.Memberships')}
        illustration="users"
      />
    );
  }

  return (
    <MemberSection
      title={t('members.profile.sectionMemberhsips', {
        amount: daos?.length,
      })}
    >
      <div className="flex flex-col items-start gap-3">
        <div className="flex w-full flex-col gap-2">
          {filteredDaos?.map((dao, index) => (
            <ActionItemMembership
              key={index}
              address={dao.address}
              subdomain={dao.subdomain}
              metadata={dao.metadata}
              network={dao.network}
              memberAddress={memberAddress}
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
