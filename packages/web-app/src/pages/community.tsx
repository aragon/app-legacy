import {
  AlertInline,
  IconAdd,
  IconLinkExternal,
  Pagination,
  SearchInput,
} from '@aragon/ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {MembersList} from 'components/membersList';
import {StateEmpty} from 'components/stateEmpty';
import {Loading} from 'components/temporary';
import {PageWrapper} from 'components/wrappers';
import {useNetwork} from 'context/network';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoParam} from 'hooks/useDaoParam';
import {useDebouncedState} from 'hooks/useDebouncedState';
import {PluginTypes} from 'hooks/usePluginClient';
import {CHAIN_METADATA} from 'utils/constants';

const MEMBERS_PER_PAGE = 20;

const Community: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const navigate = useNavigate();

  const {data: daoId} = useDaoParam();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetails(
    daoId!
  );

  const [page, setPage] = useState(1);
  const [debouncedTerm, searchTerm, setSearchTerm] = useDebouncedState('');

  const {
    data: {members, filteredMembers, daoToken},
    isLoading: membersLoading,
  } = useDaoMembers(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes,
    debouncedTerm
  );

  const totalMemberCount = members.length;
  const filteredMemberCount = filteredMembers.length;
  const displayedMembers = filteredMemberCount > 0 ? filteredMembers : members;

  const walletBased =
    (daoDetails?.plugins[0].id as PluginTypes) === 'multisig.plugin.dao.eth';

  /*************************************************
   *                    Handlers                   *
   *************************************************/
  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.trim());
  };

  const handleSecondaryButtonClick = () => {
    window.open(
      CHAIN_METADATA[network].explorer +
        '/token/tokenholderchart/' +
        daoToken?.address,
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
    <PageWrapper
      title={`${totalMemberCount} ${t('labels.members')}`}
      {...(walletBased
        ? {
            description: t('explore.explorer.walletBased'),
            primaryBtnProps: {
              label: t('labels.manageMember'),
              onClick: handlePrimaryClick,
            },
          }
        : {
            description: t('explore.explorer.tokenBased'),
            primaryBtnProps: {
              label: t('labels.mintTokens'),
              iconLeft: <IconAdd />,
              onClick: handlePrimaryClick,
            },
            secondaryBtnProps: {
              label: t('labels.seeAllHolders'),
              iconLeft: <IconLinkExternal />,
              onClick: handleSecondaryButtonClick,
            },
          })}
    >
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
              {debouncedTerm !== '' && !filteredMemberCount ? (
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
                      {filteredMemberCount === 1
                        ? t('labels.result')
                        : t('labels.nResults', {count: filteredMemberCount})}
                    </ResultsCountLabel>
                  )}
                  <MembersList
                    token={daoToken}
                    members={displayedMembers.slice(
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
          {(displayedMembers.length || 0) > MEMBERS_PER_PAGE && (
            <Pagination
              totalPages={
                Math.ceil(
                  (displayedMembers.length || 0) / MEMBERS_PER_PAGE
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
      </BodyContainer>
    </PageWrapper>
  );
};

const BodyContainer = styled.div.attrs({
  className: 'mt-5 desktop:space-y-8',
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
