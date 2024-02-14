import React, {useEffect, useRef} from 'react';
import {useFieldArray, useFormContext, useWatch} from 'react-hook-form';
import {Dropdown, Label, ListItemAction} from '@aragon/ods-old';
import {Button, IconType, AlertInline} from '@aragon/ods';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {Address, useEnsName} from 'wagmi';

import {useAlertContext} from 'context/alert';
import {useNetwork} from 'context/network';
import useScreen from 'hooks/useScreen';
import {useWallet} from 'hooks/useWallet';
import {CHAIN_METADATA} from 'utils/constants';
import {Row} from './row';

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
  const {fields, update, replace, append, remove} = useFieldArray({
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

  // reset wallet
  const handleResetEntry = (index: number) => {
    update(index, {address: '', ensName: ''});
    alert(t('alert.chip.resetAddress'));
    trigger('multisigWallets');
  };

  // reset all wallets
  const handleResetAll = () => {
    controlledWallets.forEach((_, index) => {
      // skip the first one because is the own address
      if (index > 0) {
        update(index, {address: '', ensName: ''});
      }
    });
    alert(t('alert.chip.resetAllAddresses'));
    trigger('multisigWallets');
  };

  const {isMobile} = useScreen();

  return (
    <Container>
      <DescriptionContainer>
        <Label
          label={t('createDAO.step3.multisigMembers')}
          helpText={t('createDAO.step3.multisigMembersHelptext')}
          renderHtml
        />
      </DescriptionContainer>
      <TableContainer>
        {!isMobile && (
          <TableTitleContainer>
            <Title>{t('labels.whitelistWallets.address')}</Title>
          </TableTitleContainer>
        )}
        {controlledWallets.map((field, index) => (
          <div key={field.id}>
            {(!isMobile || (isMobile && index !== 0)) && <Divider />}
            <Row
              index={index}
              onResetEntry={handleResetEntry}
              onDeleteEntry={handleDeleteEntry}
            />
          </div>
        ))}
        <Divider />
        <ActionsContainer>
          <TextButtonsContainer>
            <Button variant="secondary" size="lg" onClick={handleAdd}>
              {t('labels.whitelistWallets.addAddress')}
            </Button>
            {/*
          To be enabled when csv functionality is there
          <ButtonText
            label={t('labels.whitelistWallets.uploadCSV')}
            mode="ghost"
            size="large"
            onClick={() => alert('upload CSV here')}
          /> */}
          </TextButtonsContainer>
          <Dropdown
            side="bottom"
            align="start"
            sideOffset={4}
            trigger={
              <Button
                size="lg"
                variant="tertiary"
                iconLeft={IconType.MENU_VERTICAL}
                data-testid="trigger"
              />
            }
            listItems={[
              {
                component: (
                  <ListItemAction
                    title={t('labels.whitelistWallets.resetAllEntries')}
                    bgWhite
                  />
                ),
                callback: handleResetAll,
              },
              {
                component: (
                  <ListItemAction
                    title={t('labels.whitelistWallets.deleteAllEntries')}
                    bgWhite
                  />
                ),
                callback: handleDeleteAll,
              },
            ]}
          />
        </ActionsContainer>
        <Divider />
        <SummaryContainer>
          <Title>{t('labels.summary')}</Title>
          <TotalWalletsContainer>
            <Text>{t('labels.whitelistWallets.totalWallets')}</Text>
            <Title>{controlledWallets.length}</Title>
          </TotalWalletsContainer>
        </SummaryContainer>
      </TableContainer>
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
const TableContainer = styled.div.attrs(() => ({
  className: 'rounded-xl bg-neutral-0 flex flex-col',
}))``;
const TableTitleContainer = styled.div.attrs(() => ({
  className: 'mx-6 mt-6 mb-3',
}))``;
const Title = styled.p.attrs({
  className: 'ft-text-base xl:font-semibold font-semibold text-neutral-800',
})``;
const Text = styled.p.attrs({
  className: 'ft-text-base  text-neutral-600',
})``;
const Divider = styled.div.attrs(() => ({
  className: 'flex bg-neutral-50 h-0.5',
}))``;
const ActionsContainer = styled.div.attrs(() => ({
  className: 'flex xl:px-6 xl:py-3 p-4 place-content-between',
}))``;
const TextButtonsContainer = styled.div.attrs(() => ({
  className: 'flex gap-4',
}))``;

const SummaryContainer = styled.div.attrs(() => ({
  className: 'flex xl:p-6 p-4 flex-col space-y-3',
}))``;
const TotalWalletsContainer = styled.div.attrs(() => ({
  className: 'flex place-content-between',
}))``;
