import {SearchInput, VoterType, VotersTable} from '@aragon/ods-old';
import React, {useCallback, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {TokenVotingWalletField} from 'components/addWallets/row';
import {MultisigWalletField} from 'components/multisigWallets/row';
import {getUserFriendlyWalletLabel} from 'utils/library';

type FilteredAddressListProps = {
  wallets: TokenVotingWalletField[] | MultisigWalletField[];
  tokenSymbol?: string;
  onVoterClick?: (address: string) => void;
};

/**
 * Component to filter a list of addresses.
 * @param wallets {TokenVotingWalletField[] | MultisigWalletField[]}
 * @param tokenSymbol If token symbol is defined it treat the addresses as TokenVotingWalletField, which mean that shows
 * an amount on the voters table.
 */
export const FilteredAddressList = ({
  wallets,
  tokenSymbol,
  onVoterClick = () => {},
}: FilteredAddressListProps) => {
  const [searchValue, setSearchValue] = useState('');
  const {t} = useTranslation();

  const filterValidator = useCallback(
    (wallet: TokenVotingWalletField | MultisigWalletField) => {
      if (searchValue !== '') {
        const re = new RegExp(searchValue, 'i');

        return wallet?.address?.match(re) || wallet?.ensName.match(re);
      }
      return true;
    },
    [searchValue]
  );

  const filteredAddressList = useMemo(() => {
    if (!wallets) return [];
    if (tokenSymbol) {
      return (wallets as TokenVotingWalletField[]).filter(filterValidator).map(
        ({address, amount, ensName}) =>
          ({
            wallet: ensName || getUserFriendlyWalletLabel(address, t),
            tokenAmount: `${amount} ${tokenSymbol}`,
          }) as VoterType
      );
    }

    // multisig
    return (wallets as MultisigWalletField[])
      .filter(filterValidator)
      .map(({address, ensName}) => ({wallet: ensName || address}) as VoterType);
  }, [filterValidator, wallets, t, tokenSymbol]);

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <>
      <ModalHeader>
        <SearchInput
          value={searchValue}
          placeholder={t('placeHolders.searchTokens')}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchValue(e.target.value)
          }
        />
      </ModalHeader>
      <Container>
        {filteredAddressList?.length > 0 ? (
          <VotersTable
            voters={filteredAddressList}
            {...(tokenSymbol && {showAmount: true})}
            pageSize={filteredAddressList.length}
            LoadMoreLabel={t('community.votersTable.loadMore')}
            onVoterClick={onVoterClick}
          />
        ) : (
          // this view is temporary until designs arrive
          <span>{t('AddressModal.noAddresses')}</span>
        )}
      </Container>
    </>
  );
};

const ModalHeader = styled.div.attrs({
  className: 'p-3 bg-ui-0 rounded-xl sticky top-0',
})`
  box-shadow:
    0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06),
    0px 0px 1px rgba(31, 41, 51, 0.04);
  border-radius: 12px;
`;

const Container = styled.div.attrs({
  className: 'p-3 max-h-96 overflow-auto',
})``;
