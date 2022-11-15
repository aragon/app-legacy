import {
  ButtonIcon,
  ButtonText,
  Dropdown,
  IconMenuVertical,
  ListItemAction,
} from '@aragon/ui-components';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import React, {useEffect} from 'react';
import {useFieldArray, useFormContext, useWatch} from 'react-hook-form';

import {Row} from './row';
import {useWallet} from 'hooks/useWallet';
import {useAlertContext} from 'context/alert';

export const WhitelistWallets = () => {
  const {t} = useTranslation();
  const {address} = useWallet();
  const {alert} = useAlertContext();

  const {control, trigger} = useFormContext();
  const whitelistWallets = useWatch({name: 'whitelistWallets', control});
  const {fields, update, replace, append, remove} = useFieldArray({
    control,
    name: 'whitelistWallets',
  });

  const controlledWallets = fields.map((field, index) => {
    return {
      ...field,
      ...(whitelistWallets && {...whitelistWallets[index]}),
    };
  });

  useEffect(() => {
    if (address && !whitelistWallets) {
      append({address});
    }
  }, [address, append, whitelistWallets]);

  // add empty wallet
  const handleAdd = () => {
    append({address: ''});
    alert(t('alert.chip.addressAdded'));
    setTimeout(() => {
      trigger(`whitelistWallets.${controlledWallets.length}.address`);
    }, 50);
  };

  // remove wallet
  const handleDeleteEntry = (index: number) => {
    remove(index);
    alert(t('alert.chip.removedAddress'));
    trigger('whitelistWallets');
  };

  // remove all wallets
  const handleDeleteAll = () => {
    alert(t('alert.chip.removedAllAddresses'));
    replace([{address: address}]);
  };

  // reset wallet
  const handleResetEntry = (index: number) => {
    update(index, {address: ''});
    alert(t('alert.chip.resetAddress'));
    trigger('whitelistWallets');
  };

  // reset all wallets
  const handleResetAll = () => {
    controlledWallets.forEach((_, index) => {
      // skip the first one because is the own address
      if (index > 0) {
        update(index, {address: ''});
      }
    });
    alert(t('alert.chip.resetAllAddresses'));
    trigger('whitelistWallets');
  };

  return (
    <Container>
      <TableContainer>
        <Header>{t('labels.whitelistWallets.address')}</Header>
        {controlledWallets.map((field, index) => (
          <div key={field.id}>
            <Divider />
            <Row
              index={index}
              onResetEntry={handleResetEntry}
              onDeleteEntry={handleDeleteEntry}
            />
          </div>
        ))}
        <Divider />
        <Footer>
          {controlledWallets.length !== 1
            ? t('labels.whitelistWallets.addresses', {
                count: controlledWallets.length,
              })
            : `1 ${t('labels.whitelistWallets.address')}`}
        </Footer>
      </TableContainer>
      <ActionsContainer>
        <TextButtonsContainer>
          <ButtonText
            label={t('labels.whitelistWallets.addAddress')}
            mode="secondary"
            size="large"
            onClick={handleAdd}
          />
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
            <ButtonIcon
              size="large"
              mode="secondary"
              icon={<IconMenuVertical />}
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
    </Container>
  );
};

const TableContainer = styled.div.attrs(() => ({
  className: 'rounded-xl bg-ui-0 flex flex-col',
}))``;
const Container = styled.div.attrs(() => ({
  className: 'gap-2 flex flex-col',
}))``;
const Header = styled.div.attrs(() => ({
  className: 'pt-3 pl-4 pb-1.5 text-ui-800 font-bold',
}))``;
const Footer = styled.div.attrs(() => ({
  className: 'px-3 py-4 text-ui-800 font-bold',
}))``;
const Divider = styled.div.attrs(() => ({
  className: 'flex bg-ui-50 h-0.25',
}))``;
const ActionsContainer = styled.div.attrs(() => ({
  className: 'flex place-content-between',
}))``;
const TextButtonsContainer = styled.div.attrs(() => ({
  className: 'flex gap-2',
}))``;
