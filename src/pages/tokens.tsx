import {IconAdd, SearchInput} from '@aragon/ods-old';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import TokenList from 'components/tokenList';
import {PageWrapper} from 'components/wrappers';
import {useGlobalModalContext} from 'context/globalModals';
import {useDaoVault} from 'hooks/useDaoVault';
import {filterTokens, sortTokens} from 'utils/tokens';
import type {VaultToken} from 'utils/types';

export const Tokens: React.FC = () => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();

  const [searchTerm, setSearchTerm] = useState('');

  const {tokens} = useDaoVault();
  const filteredTokens: VaultToken[] = filterTokens(tokens, searchTerm);
  sortTokens(filteredTokens, 'treasurySharePercentage', true);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <PageWrapper
      title={t('allTokens.title')}
      description={
        tokens.length === 1
          ? t('allTokens.subtitleSingular')
          : t('allTokens.subtitle', {count: tokens.length})
      }
      primaryBtnProps={{
        label: t('TransferModal.newTransfer'),
        iconLeft: <IconAdd />,
        onClick: () => open('transfer'),
      }}
    >
      <div className="mt-3 space-y-3 desktop:mt-8 desktop:space-y-5">
        <SearchInput
          placeholder="Type to filter"
          value={searchTerm}
          onChange={handleChange}
        />
        <TokenList tokens={filteredTokens} />
      </div>
    </PageWrapper>
  );
};
