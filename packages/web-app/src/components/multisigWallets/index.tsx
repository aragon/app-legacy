import {
  AlertInline,
  ButtonIcon,
  ButtonText,
  Dropdown,
  IconMenuVertical,
  Label,
  ListItemAction,
} from '@aragon/ui-components';
import React, {useEffect} from 'react';
import {useFieldArray, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {useAlertContext} from 'context/alert';
import {useProviders} from 'context/providers';
import useScreen from 'hooks/useScreen';
import {useWallet} from 'hooks/useWallet';
import {Web3Address} from 'utils/library';
import {Row} from './row';

export const MultisigWallets = () => {
  const {t} = useTranslation();
  const {address} = useWallet();
  const {alert} = useAlertContext();
  const {infura: provider} = useProviders();

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
    async function appendConnectedWallet() {
      if (address && !multisigWallets) {
        try {
          const addressToAppend = await Web3Address.create(provider, {address});

          append({
            web3Address: {
              address: addressToAppend.address,
              ensName: addressToAppend.ensName,
            },
          });
          setFocus('multisigWallets');
        } catch (error) {
          console.error(error);
        }
      }
    }

    appendConnectedWallet();
  }, [address, append, multisigWallets, provider]);

  // add empty wallet
  const handleAdd = () => {
    append({web3Address: {address: '', ensName: ''}});
    alert(t('alert.chip.addressAdded'));
    const id = `multisigWallets.${controlledWallets.length}.web3Address`;
    setTimeout(() => {
      setFocus(id);
      trigger(id);
    }, 50);
  };

  // remove wallet
  const handleDeleteEntry = (index: number) => {
    remove(index);
    alert(t('alert.chip.removedAddress'));
    setTimeout(() => trigger('multisigWallets'), 50);
  };

  // remove all wallets
  const handleDeleteAll = () => {
    alert(t('alert.chip.removedAllAddresses'));
    replace([{web3Address: {address: '', ensName: ''}}]);
  };

  // reset wallet
  const handleResetEntry = (index: number) => {
    update(index, {web3Address: {address: '', ensName: ''}});
    alert(t('alert.chip.resetAddress'));
    trigger('multisigWallets');
  };

  // reset all wallets
  const handleResetAll = () => {
    controlledWallets.forEach((_, index) => {
      // skip the first one because is the own address
      if (index > 0) {
        update(index, {web3Address: {address: '', ensName: ''}});
      }
    });
    alert(t('alert.chip.resetAllAddresses'));
    trigger('multisigWallets');
  };

  const {isMobile} = useScreen();

  return (
    <Container>
      <pre>{JSON.stringify(controlledWallets, null, 2)}</pre>
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
            <ButtonText
              label={t('labels.whitelistWallets.addAddress')}
              mode="secondary"
              size="large"
              bgWhite
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
                bgWhite
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
        label={t('createDAO.step3.multisigMembersWalletAlert')}
        mode="neutral"
      />
    </Container>
  );
};

const Container = styled.div.attrs(() => ({
  className: 'space-y-1.5 flex flex-col',
}))``;
const DescriptionContainer = styled.div.attrs(() => ({
  className: 'space-y-0.5 flex flex-col',
}))``;
const TableContainer = styled.div.attrs(() => ({
  className: 'rounded-xl bg-ui-0 flex flex-col',
}))``;
const TableTitleContainer = styled.div.attrs(() => ({
  className: 'mx-3 mt-3 mb-1.5',
}))``;
const Title = styled.p.attrs({
  className: 'ft-text-base desktop:font-bold font-semibold text-ui-800',
})``;
const Text = styled.p.attrs({
  className: 'ft-text-base  text-ui-600',
})``;
const Divider = styled.div.attrs(() => ({
  className: 'flex bg-ui-50 h-0.25',
}))``;
const ActionsContainer = styled.div.attrs(() => ({
  className: 'flex desktop:px-3 desktop:py-1.5 p-2 place-content-between',
}))``;
const TextButtonsContainer = styled.div.attrs(() => ({
  className: 'flex gap-2',
}))``;

const SummaryContainer = styled.div.attrs(() => ({
  className: 'flex desktop:p-3 p-2 flex-col space-y-1.5',
}))``;
const TotalWalletsContainer = styled.div.attrs(() => ({
  className: 'flex place-content-between',
}))``;
