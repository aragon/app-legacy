import {
  AlertInline,
  ButtonIcon,
  ButtonText,
  Dropdown,
  IconMenuVertical,
  Label,
  ListItemAction,
} from '@aragon/ui-components';
import {useAlertContext} from 'context/alert';
import useScreen from 'hooks/useScreen';
import {useWallet} from 'hooks/useWallet';
import React, {useEffect} from 'react';
import {useFieldArray, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {Row} from './row';

export const MultisigWallets = () => {
  const {t} = useTranslation();
  const {address} = useWallet();
  const {alert} = useAlertContext();

  const {control, trigger} = useFormContext();
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
    if (address && !multisigWallets) {
      console.log(address);
      append({address});
    }
  }, [address, append, multisigWallets]);

  // add empty wallet
  const handleAdd = () => {
    append({address: ''});
    alert(t('alert.chip.addressAdded'));
    setTimeout(() => {
      trigger(`multisigWallets.${controlledWallets.length}.address`);
    }, 50);
  };

  // remove wallet
  const handleDeleteEntry = (index: number) => {
    remove(index);
    alert(t('alert.chip.removedAddress'));
    trigger('multisigWallets');
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
    trigger('multisigWallets');
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
            {!isMobile && index !== 0 && <Divider />}
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
          <Title>{t('labels.whitelistWallets.summary')}</Title>
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
  className: 'flex desktop:p-3 p-2 pt-3 flex-col space-y-1.5',
}))``;
const TotalWalletsContainer = styled.div.attrs(() => ({
  className: 'flex place-content-between',
}))``;
