import React, {useEffect, useRef} from 'react';
import {useFieldArray, useFormContext, useWatch} from 'react-hook-form';
import {Label} from '@aragon/ods-old';
import {AlertInline} from '@aragon/ods';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {Address} from 'viem';
import {useEnsName} from 'wagmi';

import {useAlertContext} from 'context/alert';
import {useWallet} from 'hooks/useWallet';
import {MultisigWalletField} from './row';
import {WalletTable} from './walletTable';
import {Web3Address} from 'utils/library';
import {validateWeb3Address} from 'utils/validators';

import {useNetwork} from '../../context/network';
import {CHAIN_METADATA} from '../../utils/constants';

export const MultisigWallets = () => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const appendConnectedAddress = useRef(true);

  const {network} = useNetwork();
  const {address} = useWallet();

  const {data: ensName} = useEnsName({
    address: address as Address,
    chainId: CHAIN_METADATA[network].id,
  });

  const {control, trigger, setFocus} = useFormContext();
  const multisigWallets = useWatch({name: 'multisigWallets', control});

  const {fields, replace, append, remove} = useFieldArray({
    control,
    name: 'multisigWallets',
  });

  const controlledWallets = fields.map((field, index) => {
    return {
      ...field,
      ...(multisigWallets && {...multisigWallets[index]}),
    };
  });

  useEffect(() => {
    if (
      address &&
      controlledWallets?.length === 0 &&
      appendConnectedAddress.current === true
    ) {
      append({address, ensName});
      appendConnectedAddress.current = false;
    }
  }, [address, append, controlledWallets?.length, ensName]);

  // add empty wallet
  const handleAdd = () => {
    append({address: '', ensName: ''});
    alert(t('alert.chip.addressAdded'));
    const id = `multisigWallets.${controlledWallets.length}`;
    setTimeout(() => {
      setFocus(id);
      trigger(id);
    }, 50);
  };

  // remove wallet
  const handleDeleteEntry = (index: number) => {
    remove(index);

    alert(t('alert.chip.removedAddress'));
    setTimeout(() => {
      trigger('multisigWallets');
    }, 50);
  };

  // remove all wallets
  const handleDeleteAll = () => {
    replace([{address}]);
    alert(t('alert.chip.removedAllAddresses'));
    setTimeout(() => {
      trigger('multisigWallets');
    }, 50);
  };

  const addressValidator = async (wallet: Web3Address, index: number) => {
    let validationResult = await validateWeb3Address(
      wallet,
      t('errors.required.walletAddress'),
      t
    );

    if (multisigWallets) {
      multisigWallets.forEach(
        ({address, ensName}: MultisigWalletField, itemIndex: number) => {
          if (
            (address === wallet.address || ensName === wallet.ensName) &&
            itemIndex !== index
          ) {
            validationResult = t('errors.duplicateAddress');
          }
        }
      );
    }
    return validationResult;
  };

  return (
    <Container>
      <DescriptionContainer>
        <Label
          label={t('createDAO.step3.multisigMembers')}
          helpText={t('createDAO.step3.multisigMembersHelptext')}
          renderHtml
        />
      </DescriptionContainer>
      <WalletTable
        controlledWallets={controlledWallets}
        handleAdd={handleAdd}
        handleDeleteEntry={handleDeleteEntry}
        handleDeleteAll={handleDeleteAll}
        rowValidator={addressValidator}
        walletFieldName={'multisigWallets'}
      />
      <AlertInline
        message={t('createDAO.step3.multisigMembersWalletAlert')}
        variant="info"
      />
    </Container>
  );
};

const Container = styled.div.attrs(() => ({
  className: 'space-y-3 flex flex-col',
}))``;

const DescriptionContainer = styled.div.attrs(() => ({
  className: 'space-y-1 flex flex-col',
}))``;
