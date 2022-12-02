import {IconAdd, SearchInput} from '@aragon/ui-components';
import {useTranslation} from 'react-i18next';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useState} from 'react';

import TokenList from 'components/tokenList';
import {useDaoVault} from 'hooks/useDaoVault';
import {PageWrapper} from 'components/wrappers';
import {filterTokens} from 'utils/tokens';
import type {VaultToken} from 'utils/types';
import {useGlobalModalContext} from 'context/globalModals';
import {Loading} from 'components/temporary';
import {useDaoParam} from 'hooks/useDaoParam';

const Tokens: React.FC = () => {
  const {data: dao, isLoading} = useDaoParam();

  const {t} = useTranslation();
  const {open} = useGlobalModalContext();

  const [searchTerm, setSearchTerm] = useState('');

  const {tokens} = useDaoVault(dao);
  const filteredTokens: VaultToken[] = filterTokens(tokens, searchTerm);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  if (isLoading) {
    return <Loading />;
  }

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
        onClick: () => open(),
      }}
    >
      <div className="mt-3 desktop:mt-8 space-y-3 desktop:space-y-5">
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

export default withTransaction('Tokens', 'component')(Tokens);
