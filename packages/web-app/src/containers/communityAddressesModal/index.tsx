import React, {useState, useCallback, useMemo} from 'react';
import {VotersTable, SearchInput} from '@aragon/ui-components';
import styled from 'styled-components';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useGlobalModalContext} from 'context/globalModals';
import {getUserFriendlyWalletLabel} from 'utils/library';

type CommunityAddressesModalProps = {
  tokenMembership: boolean;
};

const CommunityAddressesModal: React.FC<CommunityAddressesModalProps> = ({
  tokenMembership,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState<number>(1);
  const {getValues} = useFormContext();
  const {isAddressesOpen, close} = useGlobalModalContext();
  const {wallets, tokenSymbol, multisigWallets} = getValues();
  const {t} = useTranslation();

  const filterValidator = useCallback(
    wallet => {
      if (searchValue !== '') {
        const re = new RegExp(searchValue, 'i');
        return wallet?.address?.match(re);
      }
      return true;
    },
    [searchValue]
  );

  const filteredAddressList = useMemo(() => {
    return (tokenMembership ? wallets : multisigWallets)
      ?.filter(filterValidator)
      .map(({address, amount}: {address: string; amount: string}) => ({
        wallet: getUserFriendlyWalletLabel(address, t),
        tokenAmount: `${amount} ${tokenSymbol}`,
      }));
  }, [
    tokenMembership,
    wallets,
    multisigWallets,
    filterValidator,
    t,
    tokenSymbol,
  ]);

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <ModalBottomSheetSwitcher
      isOpen={isAddressesOpen}
      onClose={() => close('addresses')}
      data-testid="communityModal"
    >
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
        {filteredAddressList && filteredAddressList.length !== 0 ? (
          <VotersTable
            voters={filteredAddressList.slice(0, page * 5)}
            {...(tokenMembership && {showAmount: true})}
            {...(page * 5 < filteredAddressList.length && {
              onLoadMore: () => setPage(prePage => prePage + 1),
            })}
          />
        ) : (
          // this view is temporary until designs arrive
          <span>{t('AddressModal.noAddresses')}</span>
        )}
      </Container>
    </ModalBottomSheetSwitcher>
  );
};

export default CommunityAddressesModal;

const ModalHeader = styled.div.attrs({
  className: 'p-3 bg-ui-0 rounded-xl sticky top-0',
})`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
  border-radius: 12px;
`;

const Container = styled.div.attrs({
  className: 'p-3 max-h-96 overflow-auto',
})``;
