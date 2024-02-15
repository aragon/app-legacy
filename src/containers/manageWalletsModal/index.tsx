import {CheckboxListItem, CheckboxSimple, SearchInput} from '@aragon/ods-old';
import React, {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useGlobalModalContext} from 'context/globalModals';
import {shortenAddress} from 'utils/library';
import {Button} from '@aragon/ods';

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
  const {isOpen, close} = useGlobalModalContext('manageWallet');
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
    close();
  };

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <ModalBottomSheetSwitcher
      isOpen={isOpen}
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
          <p className="text-neutral-400">{labels.label as string}</p>
          <CheckboxSimple
            label="Select All"
            multiSelect
            iconLeft={false}
            state={selectAll ? 'active' : 'default'}
            onClick={handleSelectAll}
          />
        </SelectAllContainer>

        <div className="space-y-3">
          {filteredWallets.map(wallet => (
            <CheckboxListItem
              key={wallet}
              label={shortenAddress(wallet)}
              multiSelect
              type={selectedWallets.has(wallet) ? 'active' : 'default'}
              onClick={() => handleSelectWallet(wallet)}
            />
          ))}
        </div>
      </Container>

      <ButtonContainer>
        <Button
          size="lg"
          variant="primary"
          onClick={() => {
            addWalletCallback(Array.from(selectedWallets));
            handleClose();
          }}
        >
          {labels.button as string}
        </Button>
        <Button variant="tertiary" size="lg" onClick={handleClose}>
          {t('labels.cancel')}
        </Button>
      </ButtonContainer>
    </ModalBottomSheetSwitcher>
  );
};

export default ManageWalletsModal;

const ModalHeader = styled.div.attrs({
  className: 'p-6 bg-neutral-0 rounded-xl sticky top-0',
})`
  box-shadow:
    0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const Container = styled.div.attrs({
  className: 'p-6 max-h-96 overflow-auto',
})``;

const SelectAllContainer = styled.div.attrs({
  className: 'flex justify-between items-center mb-5 mr-[18px]',
})``;

const ButtonContainer = styled.div.attrs({
  className: 'flex py-4 px-6 space-x-4 bg-neutral-0',
})``;
