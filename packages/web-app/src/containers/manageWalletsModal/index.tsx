import React, {useEffect, useState, useMemo} from 'react';
import {
  SearchInput,
  CheckboxListItem,
  ButtonText,
  CheckboxSimple,
} from '@aragon/ui-components';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useGlobalModalContext} from 'context/globalModals';
import {shortenAddress} from '@aragon/ui-components/src/utils/addresses';

type ManageWalletsModalProps = {
  addWalletCallback: (wallets: Array<string>) => void;
  wallets: Array<string>;
  initialSelections?: Array<string>;
};

type SelectableWallets = Set<string>;

const ManageWalletsModal: React.FC<ManageWalletsModalProps> = ({
  addWalletCallback,
  wallets,
  initialSelections,
}) => {
  const {t} = useTranslation();
  const {isManageWalletOpen, close} = useGlobalModalContext();
  const [searchValue, setSearchValue] = useState('');
  const [selectedWallets, setSelectedWallets] = useState<SelectableWallets>(
    new Set()
  );

  const selectedWalletsNum = selectedWallets.size;
  const selectAll = selectedWalletsNum === wallets.length;

  const filteredWallets = useMemo(() => {
    if (searchValue !== '') {
      const re = new RegExp(searchValue, 'i');
      return wallets.filter(wallet => wallet.match(re));
    }
    return wallets;
  }, [searchValue, wallets]);

  const labels = useMemo(() => {
    if (selectedWalletsNum === 0) {
      return {
        button: t('labels.selectWallets'),
        label: t('labels.noAddressSelected'),
      };
    } else if (selectedWalletsNum === 1) {
      return {
        button: t('labels.addSingleWallet'),
        label: t('labels.singleAddressSelected'),
      };
    } else {
      return {
        button: t('labels.addNWallets', {walletCount: selectedWalletsNum}),
        label: t('labels.nAddressesSelected', {
          walletCount: selectedWalletsNum,
        }),
      };
    }
  }, [selectedWalletsNum, t]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  useEffect(() => {
    /**
     * Note: I very much dislike this pattern. That said, we need
     * to somehow both load initial selections and keep them in sync
     * with what the user has selected. Cancelling after changing the
     * initial state will not work otherwise.
     */
    // map initial selections to selectedWallets.
    if (initialSelections) {
      setSelectedWallets(new Set(initialSelections));
    }
  }, [initialSelections]);

  // handles select all checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedWallets(new Set());
    } else {
      setSelectedWallets(previousState => {
        const temp = new Set(previousState);

        wallets.forEach(address => {
          // not checking if address is already in the set because
          // add should only add if element is not already in the set
          temp.add(address);
        });

        return temp;
      });
    }
  };

  // handles checkbox selection for individual wallets
  const handleSelectWallet = (wallet: string) => {
    setSelectedWallets(previousState => {
      const temp = new Set(previousState);

      if (previousState.has(wallet)) temp.delete(wallet);
      else temp.add(wallet);

      return temp;
    });
  };

  // handles cleanup after modal is closed.
  const handleClose = () => {
    setSearchValue('');
    setSelectedWallets(new Set());
    close('manageWallet');
  };

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <ModalBottomSheetSwitcher
      isOpen={isManageWalletOpen}
      onClose={handleClose}
      data-testid="manageWalletModal"
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
        <SelectAllContainer>
          <p className="text-ui-400">{labels.label as string}</p>
          <CheckboxSimple
            label="Select All"
            multiSelect
            iconLeft={false}
            state={selectAll ? 'active' : 'default'}
            onClick={handleSelectAll}
          />
        </SelectAllContainer>

        <div className="space-y-1.5">
          {filteredWallets.map(wallet => (
            <CheckboxListItem
              key={wallet}
              label={shortenAddress(wallet)}
              multiSelect
              state={selectedWallets.has(wallet) ? 'active' : 'default'}
              onClick={() => handleSelectWallet(wallet)}
            />
          ))}
        </div>
      </Container>

      <ButtonContainer>
        <ButtonText
          label={labels.button as string}
          size="large"
          onClick={() => {
            addWalletCallback(Array.from(selectedWallets));
            handleClose();
          }}
        />
        <ButtonText
          label={t('labels.cancel')}
          mode="secondary"
          size="large"
          bgWhite
          onClick={handleClose}
        />
      </ButtonContainer>
    </ModalBottomSheetSwitcher>
  );
};

export default ManageWalletsModal;

const ModalHeader = styled.div.attrs({
  className: 'p-3 bg-ui-0 rounded-xl sticky top-0',
})`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const Container = styled.div.attrs({
  className: 'p-3 max-h-96 overflow-auto',
})``;

const SelectAllContainer = styled.div.attrs({
  className: 'flex justify-between items-center mb-2.5 mr-2.25',
})``;

const ButtonContainer = styled.div.attrs({
  className: 'flex py-2 px-3 space-x-2 bg-white',
})``;
