import {
  AlertInline,
  HeaderPage,
  Pagination,
  SearchInput,
  StateEmpty,
} from '@aragon/ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {MembersList} from 'components/membersList';
import {Loading} from 'components/temporary';
import {useNetwork} from 'context/network';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoParam} from 'hooks/useDaoParam';
import {useDebouncedState} from 'hooks/useDebouncedState';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';
import {PluginTypes} from 'hooks/usePluginClient';
import {CHAIN_METADATA} from 'utils/constants';

// The number of members displayed on each page
const MEMBERS_PER_PAGE = 2;

const Community: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const navigate = useNavigate();

  const {breadcrumbs, icon, tag} = useMappedBreadcrumbs();

  const {data: daoId} = useDaoParam();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetails(
    daoId!
  );

  const [page, setPage] = useState(1);
  const [debouncedTerm, searchTerm, setSearchTerm] = useDebouncedState('');

  const {
    data: {members, totalMembers},
    isLoading: membersLoading,
  } = useDaoMembers(daoId, daoDetails?.plugins[0].id as PluginTypes);

  // NOTE: Temporarily mocking token information, as SDK does not yet expose this.
  const token = {
    id: '0x35f7A3379B8D0613c3F753863edc85997D8D0968',
    symbol: 'DTT',
  };
  const walletBased =
    (daoDetails?.plugins[0].id as PluginTypes) === 'addresslistvoting.dao.eth';

  /*************************************************
   *                    Handlers                   *
   *************************************************/
  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.trim());
  };

  const handleSecondaryButtonClick = () => {
    window.open(
      CHAIN_METADATA[network].explorer + '/token/tokenholderchart/' + token?.id,
      '_blank'
    );
  };

  const handlePrimaryClick = () => {
    if (walletBased) {
      navigate('manage-members');
    } else {
      navigate('mint-tokens');
    }
  };

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (detailsAreLoading || membersLoading) return <Loading />;

  return (
    <>
      <HeaderContainer>
        <HeaderPage
          tag={tag}
          icon={icon}
          crumbs={breadcrumbs}
          title={`${totalMembers} ${t('labels.members')}`}
          onClick={handlePrimaryClick}
          {...(walletBased
            ? {
                description: t('explore.explorer.walletBased'),
                buttonLabel: t('labels.manageMember'),
              }
            : {
                description: t('explore.explorer.tokenBased'),
                buttonLabel: t('labels.addMember'),
                secondaryButtonLabel: t('labels.seeAllHolders'),
                secondaryOnClick: handleSecondaryButtonClick,
              })}
        />
      </HeaderContainer>

      <BodyContainer>
        <SearchAndResultWrapper>
          {/* Search input */}
          <InputWrapper>
            <SearchInput
              placeholder={t('labels.searchPlaceholder')}
              value={searchTerm}
              onChange={handleQueryChange}
            />
            {!walletBased && (
              <AlertInline label={t('alert.tokenBasedMembers') as string} />
            )}
          </InputWrapper>

          {/* Members List */}
          {membersLoading ? (
            <Loading />
          ) : (
            <>
              {debouncedTerm !== '' && members.length === 0 ? (
                <StateEmpty
                  type="Object"
                  mode="inline"
                  object="magnifying_glass"
                  title={t('labels.noResults')}
                  description={t('labels.noResultsSubtitle')}
                />
              ) : (
                <>
                  {debouncedTerm !== '' && !membersLoading && (
                    <ResultsCountLabel>
                      {members.length === 1
                        ? t('labels.result')
                        : t('labels.nResults', {count: members.length})}
                    </ResultsCountLabel>
                  )}
                  <MembersList
                    token={token}
                    members={members.slice(
                      (page - 1) * MEMBERS_PER_PAGE,
                      page * MEMBERS_PER_PAGE
                    )}
                  />
                </>
              )}
            </>
          )}
        </SearchAndResultWrapper>

        {/* Pagination */}
        <PaginationWrapper>
          {(members.length || 0) > MEMBERS_PER_PAGE && (
            <Pagination
              totalPages={
                Math.ceil((members.length || 0) / MEMBERS_PER_PAGE) as number
              }
              activePage={page}
              onChange={(activePage: number) => {
                setPage(activePage);
                window.scrollTo({top: 0, behavior: 'smooth'});
              }}
            />
          )}
        </PaginationWrapper>
      </BodyContainer>
    </>
  );
};

const HeaderContainer = styled.div.attrs({
  className:
    'col-span-full desktop:col-start-2 desktop:col-end-12 -mx-2 tablet:mx-0 tablet:mt-3 desktop:mt-5',
})``;

const BodyContainer = styled.div.attrs({
  className:
    'col-span-full desktop:col-start-3 desktop:col-end-11 mt-5 desktop:space-y-8',
})``;

const SearchAndResultWrapper = styled.div.attrs({className: 'space-y-3'})``;

const ResultsCountLabel = styled.p.attrs({
  className: 'font-bold text-ui-800 ft-text-lg',
})``;

const PaginationWrapper = styled.div.attrs({
  className: 'flex mt-8',
})``;

const InputWrapper = styled.div.attrs({
  className: 'space-y-1',
})``;

export default withTransaction('Community', 'component')(Community);
