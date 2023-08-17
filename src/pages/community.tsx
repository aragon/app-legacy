import {
  AlertInline,
  IconAdd,
  IconLinkExternal,
  Pagination,
  SearchInput,
  IllustrationHuman,
} from '@aragon/ods';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {MembersList} from 'components/membersList';
import {StateEmpty} from 'components/stateEmpty';
import {Loading} from 'components/temporary';
import {PageWrapper} from 'components/wrappers';
import {useNetwork} from 'context/network';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {useDebouncedState} from 'hooks/useDebouncedState';
import {PluginTypes} from 'hooks/usePluginClient';
import {CHAIN_METADATA} from 'utils/constants';
import PageEmptyState from 'containers/pageEmptyState';
import {htmlIn} from 'utils/htmlIn';
import useScreen from 'hooks/useScreen';
import {useGovTokensWrapping} from 'context/govTokensWrapping';
import {useExistingToken} from 'hooks/useExistingToken';
import {Erc20WrapperTokenDetails} from '@aragon/sdk-client';

const MEMBERS_PER_PAGE = 20;

export const Community: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const navigate = useNavigate();
  const {isMobile} = useScreen();
  const {handleOpenModal} = useGovTokensWrapping();

  const [page, setPage] = useState(1);
  const [debouncedTerm, searchTerm, setSearchTerm] = useDebouncedState('');

  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetailsQuery();
  const {
    data: {members, filteredMembers, daoToken},
    isLoading: membersLoading,
  } = useDaoMembers(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes,
    debouncedTerm
  );

  const {isDAOTokenWrapped, isTokenMintable} = useExistingToken({
    daoToken,
    daoDetails,
  });

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
    } else if (isDAOTokenWrapped) {
      handleOpenModal();
    } else if (isTokenMintable) {
      navigate('mint-tokens');
    }
  };

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (detailsAreLoading || membersLoading) return <Loading />;

  if (!totalMemberCount && isDAOTokenWrapped) {
    return (
      <PageEmptyState
        title={t('community.emptyState.title')}
        subtitle={htmlIn(t)('community.emptyState.desc', {
          tokenSymbol:
            (daoToken as Erc20WrapperTokenDetails)?.underlyingToken?.symbol ||
            daoToken?.symbol,
        })}
        Illustration={
          <div className="flex">
            <IllustrationHuman
              {...{
                body: 'elevating',
                expression: 'smile_wink',
                hair: 'middle',
                sunglass: 'big_rounded',
                accessory: 'buddha',
              }}
              {...(isMobile
                ? {height: 165, width: 295}
                : {height: 225, width: 400})}
            />
          </div>
        }
        buttonLabel={t('community.emptyState.ctaLabel')}
        onClick={handleOpenModal}
      />
    );
  }

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
        : isDAOTokenWrapped
        ? {
            description: t('explore.explorer.tokenBased'),
            primaryBtnProps: {
              label: t('community.ctaMain.wrappedLabel'),
              onClick: handlePrimaryClick,
            },
            secondaryBtnProps: {
              label: t('labels.seeAllHolders'),
              iconLeft: <IconLinkExternal />,
              onClick: handleSecondaryButtonClick,
            },
          }
        : isTokenMintable
        ? {
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
          }
        : {
            description: t('explore.explorer.tokenBased'),
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
