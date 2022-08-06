import {
  HeaderPage,
  SearchInput,
  AlertInline,
  Pagination,
  StateEmpty,
} from '@aragon/ui-components';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import React, {useState} from 'react';
import {withTransaction} from '@elastic/apm-rum-react';

import {Loading} from 'components/temporary';
import {useNetwork} from 'context/network';
import {MembersList} from 'components/membersList';
import {useDaoParam} from 'hooks/useDaoParam';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoMetadata} from 'hooks/useDaoMetadata';
import {CHAIN_METADATA} from 'utils/constants';
import {useDebouncedState} from 'hooks/useDebouncedState';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';

// The number of members displayed on each page
const MEMBERS_PER_PAGE = 10;
import {useNavigate} from 'react-router-dom';

const Community: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const navigate = useNavigate();

  const {breadcrumbs, icon, tag} = useMappedBreadcrumbs();

  const {data: daoId} = useDaoParam();
  const {data: dao, loading: metadataLoading} = useDaoMetadata(daoId);

  const [page, setPage] = useState(1);
  const [debouncedTerm, searchTerm, setSearchTerm] = useDebouncedState('');

  const {
    data: {members, totalMembers, token},
    isLoading: membersLoading,
  } = useDaoMembers(daoId, debouncedTerm.toLowerCase());

  const walletBased = dao?.packages[0].pkg.__typename === 'WhitelistPackage';

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
      // Add/remove member flow
    } else {
      navigate('mint-tokens');
    }
  };

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (metadataLoading) return <Loading />;

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
                buttonLabel: t('labels.addMember'),
              }
            : {
                description: t('explore.explorer.tokenBased'),
                buttonLabel: t('labels.mintTokens'),
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
                  <MembersList token={token} members={members} />
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
  className: 'flex',
})``;

const InputWrapper = styled.div.attrs({
  className: 'space-y-1',
})``;

export default withTransaction('Community', 'component')(Community);
