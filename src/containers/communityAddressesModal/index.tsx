import React from 'react';
import {useFormContext} from 'react-hook-form';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useGlobalModalContext} from 'context/globalModals';
import {FilteredAddressList} from '../../components/filteredAddressList';

const CommunityAddressesModal: React.FC = () => {
  const {getValues} = useFormContext();
  const {isOpen, close} = useGlobalModalContext('addresses');
  const [wallets, tokenSymbol, multisigWallets] = getValues([
    'wallets',
    'tokenSymbol',
    'multisigWallets',
  ]);

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <ModalBottomSheetSwitcher
      isOpen={isOpen}
      onClose={close}
      data-testid="communityModal"
    >
      <FilteredAddressList
        wallets={tokenSymbol ? wallets : multisigWallets}
        tokenSymbol={tokenSymbol}
      />
    </ModalBottomSheetSwitcher>
  );
};

export default CommunityAddressesModal;
