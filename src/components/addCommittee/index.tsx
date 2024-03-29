import React, {useEffect, useRef} from 'react';
import {useFieldArray, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {Address} from 'viem';
import {useEnsName} from 'wagmi';
import {AlertInline} from '@aragon/ods';

import {useAlertContext} from 'context/alert';
import {WalletTable} from 'components/multisigWallets/walletTable';
import {Web3Address} from 'utils/library';
import {validateWeb3Address} from 'utils/validators';
import {MultisigWalletField} from '../multisigWallets/row';
import {useWallet} from 'hooks/useWallet';
import {useNetwork} from 'context/network';
import {CHAIN_METADATA} from 'utils/constants';

const AddCommittee: React.FC = () => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const appendConnectedAddress = useRef<boolean>(true);

  const {network} = useNetwork();
  const {address} = useWallet();

  const {data: ensName} = useEnsName({
    address: address as Address,
    chainId: CHAIN_METADATA[network].id,
  });

  const {control, setFocus, trigger} = useFormContext();
  const committeeWallets = useWatch({name: 'committee', control});
  const {fields, append, remove} = useFieldArray({
    name: 'committee',
    control,
  });

  const controlledWallets = fields.map((field, index) => {
    return {
      ...field,
      ...(committeeWallets && {...committeeWallets[index]}),
    };
  });

  useEffect(() => {
    if (address && fields?.length === 0 && appendConnectedAddress.current) {
      append({address, amount: '1', ensName});
      appendConnectedAddress.current = false;
    }
  }, [address, append, fields?.length, ensName, trigger]);

  // setTimeout added because instant trigger not working
  const handleAdd = () => {
    append({address: '', ensName: '', amount: 1});
    alert(t('alert.chip.addressAdded'));
    const id = `committee.${fields.length}`;
    setTimeout(() => {
      setFocus(id);
      trigger(id);
    }, 50);
  };

  const handleDeleteEntry = (index: number) => {
    remove(index);
    alert(t('alert.chip.removedAddress'));
    setTimeout(() => {
      trigger('committee');
    });
  };

  const handleDeleteAll = () => {
    remove();
    alert(t('alert.chip.removedAllAddresses'));
    setTimeout(() => {
      trigger('multisigWallets');
    }, 50);
  };

  const addressValidator = async (web3Address: Web3Address, index: number) => {
    // check if address is valid
    let validationResult = await validateWeb3Address(
      web3Address,
      t('errors.required.walletAddress'),
      t
    );

    if (validationResult && validationResult !== true) {
      return validationResult;
    }

    if (committeeWallets) {
      committeeWallets.forEach(
        ({address, ensName}: MultisigWalletField, itemIndex: number) => {
          if (
            ((web3Address.address &&
              address.toLowerCase() === web3Address.address.toLowerCase()) ||
              (web3Address.ensName &&
                ensName.toLowerCase() === web3Address.ensName.toLowerCase())) &&
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
      <WalletTable
        controlledWallets={controlledWallets}
        handleAdd={handleAdd}
        handleDeleteEntry={handleDeleteEntry}
        handleDeleteAll={handleDeleteAll}
        rowValidator={addressValidator}
        walletFieldName={'committee'}
      />
      <AlertInline
        message={t('createDAO.step3.distributionWalletAlertText')}
        variant="info"
      />
    </Container>
  );
};

export default AddCommittee;

const Container = styled.div.attrs(() => ({
  className: 'space-y-3 flex flex-col',
}))``;
