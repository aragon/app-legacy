import {
  AlertInline,
  ButtonIcon,
  ButtonText,
  Dropdown,
  IconMenuVertical,
  ListItemAction,
} from '@aragon/ods';
import React, {useEffect} from 'react';
import {useFieldArray, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {useAlertContext} from 'context/alert';
import {useWallet} from 'hooks/useWallet';
import Footer from './footer';
import Header from './header';
import Row from './row';

const AddCommitteeMembers: React.FC = () => {
  const {t} = useTranslation();
  const {address, ensName} = useWallet();

  const {control, trigger} = useFormContext();
  const wallets = useWatch({name: 'committee', control: control});
  const {fields, append, remove} = useFieldArray({
    name: 'committee',
    control,
  });
  const {alert} = useAlertContext();

  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...(wallets && {...wallets[index]}),
    };
  });

  useEffect(() => {
    if (address && !wallets) {
      // uncomment when minting to treasury is ready
      // insert(1, {address: address, amount: '0'});
      append({address, ensName, amount: 1});
    }
  }, [address, append, ensName, wallets]);

  // setTimeout added because instant trigger not working
  const handleAddWallet = () => {
    append({address: '', ensName: '', amount: 1});
    setTimeout(() => {
      trigger(`committee.${controlledFields.length}`);
    }, 50);
  };

  const handleDeleteRow = (index: number) => {
    remove(index);
    setTimeout(() => {
      trigger('committee');
    });
  };

  return (
    <Container>
      <ListGroup>
        {controlledFields.length > 0 && <Header />}
        {controlledFields.map((field, index) => {
          return (
            <Row key={field.id} index={index} onDelete={handleDeleteRow} />
          );
        })}
        <Footer totalAddresses={fields.length || 0} />
      </ListGroup>
      <ActionsWrapper>
        <ButtonText
          label={t('labels.addWallet')}
          mode="secondary"
          size="large"
          onClick={handleAddWallet}
        />
        <Dropdown
          align="start"
          trigger={
            <ButtonIcon
              mode="ghost"
              size="large"
              bgWhite
              icon={<IconMenuVertical />}
              data-testid="trigger"
            />
          }
          sideOffset={8}
          listItems={[
            {
              component: (
                <ListItemAction
                  title={t('labels.deleteAllAddresses')}
                  bgWhite
                />
              ),
              callback: () => {
                remove();
                alert(t('alert.chip.removedAllAddresses'));
              },
            },
          ]}
        />
      </ActionsWrapper>
      <AlertInline
        label={t('alert.committee.automaticallyAdded') as string}
        mode="neutral"
      />
    </Container>
  );
};

export default AddCommitteeMembers;

const Container = styled.div.attrs({className: 'space-y-1.5'})``;

const ListGroup = styled.div.attrs({
  className: 'flex flex-col overflow-hidden space-y-0.25 rounded-xl',
})``;

const ActionsWrapper = styled.div.attrs({
  className: 'flex justify-between',
})``;
