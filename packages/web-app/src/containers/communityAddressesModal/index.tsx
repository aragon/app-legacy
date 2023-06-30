import {SearchInput, VoterType, VotersTable} from '@aragon/ui-components';
import React, {useCallback, useMemo, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {WalletField} from 'components/addWallets/row';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {WalletItem} from 'components/multisigWallets/row';
import {useGlobalModalContext} from 'context/globalModals';
import {getUserFriendlyWalletLabel} from 'utils/library';

type CommunityAddressesModalProps = {
  tokenMembership: boolean;
};

const CommunityAddressesModal: React.FC<CommunityAddressesModalProps> = ({
  tokenMembership,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const {getValues} = useFormContext();
  const {isAddressesOpen, close} = useGlobalModalContext();
  const [wallets, tokenSymbol, multisigWallets] = getValues([
    'wallets',
    'tokenSymbol',
    'multisigWallets',
  ]);
  const {t} = useTranslation();

  const filterValidator = useCallback(
    (wallet: WalletField | WalletItem) => {
      if (searchValue !== '') {
        const re = new RegExp(searchValue, 'i');

        return tokenMembership
          ? (wallet as WalletField)?.address?.match(re)
          : (wallet as WalletItem)?.web3Address?.address?.match(re);
      }
      return true;
    },
    [searchValue, tokenMembership]
  );

  const filteredAddressList = useMemo(() => {
    if (tokenMembership) {
      return (wallets as WalletField[]).filter(filterValidator).map(
        ({address, amount}) =>
          ({
            wallet: getUserFriendlyWalletLabel(address, t),
            tokenAmount: `${amount} ${tokenSymbol}`,
          } as VoterType)
      );
    }

    // multisig
    return (multisigWallets as WalletItem[])
      .filter(filterValidator)
      .map(({web3Address}) => ({wallet: web3Address.address} as VoterType));
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
        {filteredAddressList?.length > 0 ? (
          <VotersTable
            voters={filteredAddressList}
            {...(tokenMembership && {showAmount: true})}
            pageSize={filteredAddressList.length}
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
