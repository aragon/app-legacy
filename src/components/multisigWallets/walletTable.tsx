import {MultisigWalletField, Row, RowValidator} from './row';
import {Button, IconType} from '@aragon/ods';
import {Dropdown, ListItemAction} from '../../@aragon/ods-old';
import React from 'react';
import styled from 'styled-components';
import useScreen from '../../hooks/useScreen';
import {useTranslation} from 'react-i18next';
import {useFieldArray, useFormContext} from 'react-hook-form';
import {useAlertContext} from 'context/alert';

interface WalletTableProps {
  controlledWallets: MultisigWalletField[];
  handleAdd: () => void;
  handleDeleteEntry: (index: number) => void;
  handleDeleteAll: () => void;
  rowValidator: RowValidator;
  walletFieldName: string;
}

export const WalletTable: React.FC<WalletTableProps> = ({
  controlledWallets,
  handleAdd,
  handleDeleteEntry,
  handleDeleteAll,
  rowValidator,
  walletFieldName,
}) => {
  const {isMobile} = useScreen();
  const {t} = useTranslation();
  const {control, trigger} = useFormContext();
  const {alert} = useAlertContext();

  const {update} = useFieldArray({
    control,
    name: walletFieldName,
  });

  // reset wallet
  const handleResetEntry = (index: number) => {
    update(index, {address: '', ensName: ''});
    alert(t('alert.chip.resetAddress'));
    trigger(walletFieldName);
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

  return (
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
            validator={rowValidator}
            walletFieldName={walletFieldName}
          />
        </div>
      ))}
      <Divider />
      <ActionsContainer>
        <TextButtonsContainer>
          <Button variant="tertiary" size="lg" onClick={handleAdd}>
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
              iconLeft={IconType.DOTS_VERTICAL}
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
  );
};

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
