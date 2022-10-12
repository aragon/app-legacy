import {
  ButtonText,
  IconChevronDown,
  Label,
  ListItemAction,
  ListItemBlockchain,
  Popover,
} from '@aragon/ui-components';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {Controller, useFormContext} from 'react-hook-form';
import React, {useCallback, useState} from 'react';

import {i18n} from '../../../i18n.config';
import useScreen from 'hooks/useScreen';
import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';
import {useNetwork} from 'context/network';
import {trackEvent} from 'services/analytics';

type NetworkType = 'main' | 'test';
type SortFilter = 'cost' | 'popularity' | 'security';

const SelectChainForm: React.FC = () => {
  const {t} = useTranslation();
  const {isMobile} = useScreen();
  const {setNetwork} = useNetwork();
  const {control, getValues} = useFormContext();

  const [isOpen, setIsOpen] = useState(false);
  const [sortFilter, setFilter] = useState<SortFilter>('cost');
  const [networkType, setNetworkType] = useState<NetworkType>(
    () => getValues('blockchain')?.network || 'main'
  );

  const handleFilterChanged = useCallback(
    (e: React.MouseEvent) => {
      setIsOpen(false);
      const {name} = e.currentTarget as HTMLButtonElement;

      trackEvent('daoCreation_sortBy_clicked', {sort_by: name});
      if (sortFilter !== name) {
        setFilter(name as SortFilter);
      }
    },
    [sortFilter]
  );

  return (
    <>
      <Header>
        <NetworkTypeSwitcher>
          <ButtonText
            mode="secondary"
            size={isMobile ? 'small' : 'medium'}
            label={t('labels.mainNet')}
            isActive={networkType === 'main'}
            onClick={() => setNetworkType('main')}
          />
          <ButtonText
            mode="secondary"
            size={isMobile ? 'small' : 'medium'}
            label={t('labels.testNet')}
            isActive={networkType === 'test'}
            onClick={() => setNetworkType('test')}
          />
        </NetworkTypeSwitcher>
        <SortFilter>
          {!isMobile && <Label label={t('labels.sortBy')} />}
          {/* TODO: replace with proper dropdown */}
          <Popover
            side="bottom"
            open={isOpen}
            align="start"
            width={264}
            onOpenChange={(value: boolean) => setIsOpen(value)}
            content={
              <DropdownContent>
                <ListItemAction
                  name="cost"
                  mode={sortFilter === 'cost' ? 'selected' : 'default'}
                  title={t('labels.networkCost')}
                  onClick={handleFilterChanged}
                  bgWhite
                />
                <ListItemAction
                  name="popularity"
                  mode={sortFilter === 'popularity' ? 'selected' : 'default'}
                  title={t('labels.popularity')}
                  onClick={handleFilterChanged}
                  bgWhite
                />
                <ListItemAction
                  name="security"
                  mode={sortFilter === 'security' ? 'selected' : 'default'}
                  title={t('labels.security')}
                  onClick={handleFilterChanged}
                  bgWhite
                />
              </DropdownContent>
            }
          >
            <ButtonText
              label={labels[sortFilter].title}
              mode="secondary"
              size={isMobile ? 'small' : 'large'}
              isActive={isOpen}
              iconRight={<IconChevronDown />}
            />
          </Popover>
        </SortFilter>
      </Header>
      <FormItem>
        {networks[networkType][sortFilter].map((selectedNetwork, index) => (
          <Controller
            key={selectedNetwork}
            name="blockchain"
            rules={{required: true}}
            control={control}
            render={({field}) => (
              <ListItemBlockchain
                onClick={() => {
                  setNetwork(selectedNetwork);
                  field.onChange({
                    id: CHAIN_METADATA[selectedNetwork].id,
                    label: CHAIN_METADATA[selectedNetwork].name,
                    network: networkType,
                  });
                }}
                selected={CHAIN_METADATA[selectedNetwork].id === field.value.id}
                tag={index === 0 ? labels[sortFilter].tag : undefined}
                {...CHAIN_METADATA[selectedNetwork]}
              />
            )}
          />
        ))}
      </FormItem>
    </>
  );
};

export default SelectChainForm;

const Header = styled.div.attrs({className: 'flex justify-between'})``;

const NetworkTypeSwitcher = styled.div.attrs({
  className: 'flex p-0.5 space-x-0.25 bg-ui-0 rounded-xl',
})``;

const SortFilter = styled.div.attrs({
  className: 'flex items-center space-x-1.5',
})``;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const DropdownContent = styled.div.attrs({className: 'p-1.5 space-y-0.5'})``;

const labels = {
  cost: {tag: i18n.t('labels.cheapest'), title: i18n.t('labels.networkCost')},
  popularity: {
    tag: i18n.t('labels.mostPopular'),
    title: i18n.t('labels.popularity'),
  },
  security: {
    tag: i18n.t('labels.safest'),
    title: i18n.t('labels.security'),
  },
};

// Note: Default Network name in polygon network is different than Below list
type SelectableNetworks = Record<
  NetworkType,
  {
    cost: SupportedNetworks[];
    popularity: SupportedNetworks[];
    security: SupportedNetworks[];
  }
>;

const networks: SelectableNetworks = {
  main: {
    cost: ['polygon', 'arbitrum', 'ethereum'],
    popularity: ['polygon', 'ethereum', 'arbitrum'],
    security: ['ethereum', 'arbitrum', 'polygon'],
  },
  test: {
    cost: ['mumbai', 'arbitrum-test', 'goerli', 'rinkeby'],
    popularity: ['mumbai', 'goerli', 'rinkeby', 'arbitrum-test'],
    security: ['goerli', 'rinkeby', 'arbitrum-test', 'mumbai'],
  },
};
