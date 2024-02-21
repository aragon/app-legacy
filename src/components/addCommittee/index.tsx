import React, {useEffect, useRef} from 'react';
import {useFieldArray, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {Dropdown, ListItemAction} from '@aragon/ods-old';
import {IconType, Button, AlertInline} from '@aragon/ods';

import {useAlertContext} from 'context/alert';
import {useWallet} from 'hooks/useWallet';
import Footer from './addCommitteeWalletsFooter';
import Header from './addCommitteeWalletsHeader';
import Row from './addCommitteeWallet';
import {useNetwork} from '../../context/network';
import {Address, useEnsName} from 'wagmi';
import {CHAIN_METADATA} from '../../utils/constants';

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
  const {fields, append, remove} = useFieldArray({
    name: 'committee',
    control,
  });

  useEffect(() => {
    if (address && fields?.length === 0 && appendConnectedAddress.current) {
      append({address, amount: '1', ensName});
      appendConnectedAddress.current = false;
    }
  }, [address, append, fields?.length, ensName, trigger]);

  // setTimeout added because instant trigger not working
  const handleAddWallet = () => {
    append({address: '', ensName: '', amount: 1});
    alert(t('alert.chip.addressAdded'));
    const id = `committee.${fields.length}`;
    setTimeout(() => {
      setFocus(id);
      trigger(id);
    }, 50);
  };

  const handleDeleteRow = (index: number) => {
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

  return (
    <Container>
      <ListGroup>
        {fields.length > 0 && <Header />}
        {fields.map((field, index) => {
          return (
            <Row key={field.id} index={index} onDelete={handleDeleteRow} />
          );
        })}
        <Footer totalAddresses={fields.length || 0} />
      </ListGroup>
      <ActionsWrapper>
        <Button variant="tertiary" size="lg" onClick={handleAddWallet}>
          {t('labels.addWallet')}
        </Button>
        <Dropdown
          align="start"
          trigger={
            <Button
              variant="tertiary"
              size="lg"
              iconLeft={IconType.DOTS_VERTICAL}
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
              callback: handleDeleteAll,
            },
          ]}
        />
      </ActionsWrapper>
      <AlertInline
        message={t('createDAO.step3.distributionWalletAlertText') as string}
        variant="info"
      />
    </Container>
  );
};

export default AddCommittee;

const Container = styled.div.attrs({className: 'space-y-1.5'})``;

const ListGroup = styled.div.attrs({
  className: 'flex flex-col overflow-hidden space-y-0.25 rounded-xl',
})``;

const ActionsWrapper = styled.div.attrs({
  className: 'flex justify-between p-2',
})``;
