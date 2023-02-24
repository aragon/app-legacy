import {
  ButtonText,
  // Dropdown,
  // IconChevronDown,
  // ListItemAction,
  ListItemBlockchain,
} from '@aragon/ui-components';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {Controller, useFormContext} from 'react-hook-form';
import React, {useState} from 'react';

import useScreen from 'hooks/useScreen';
import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';
import {useNetwork} from 'context/network';
// import {trackEvent} from 'services/analytics';

type NetworkType = 'main' | 'test';
// type SortFilter = 'cost' | 'popularity' | 'security';

const SelectChainForm: React.FC = () => {
  const {t} = useTranslation();
  const {isMobile} = useScreen();
  const {setNetwork} = useNetwork();
  const {control} = useFormContext();

  // const [isOpen, setIsOpen] = useState(false);
  // const [sortFilter, setFilter] = useState<SortFilter>('cost');
  const [networkType, setNetworkType] = useState<NetworkType>('test');

  // moving this up so state change triggers translation changes
  const labels = {
    cost: {tag: t('labels.cheapest'), title: t('labels.networkCost')},
    popularity: {
      tag: t('labels.mostPopular'),
      title: t('labels.popularity'),
    },
    security: {
      tag: t('labels.safest'),
      title: t('labels.security'),
    },
  };

  // const handleFilterChanged = useCallback(
  //   (e: Event) => {
  //     setIsOpen(false);

  //     // Note: the dropdown returns a div parent as the target for the onSelect,
  //     // and not the original element
  //     const {name} = (e.currentTarget as HTMLDivElement)
  //       .children[0] as HTMLButtonElement;

  //     trackEvent('daoCreation_sortBy_clicked', {sort_by: name});
  //     if (sortFilter !== name) {
  //       setFilter(name as SortFilter);
  //     }
  //   },
  //   [sortFilter]
  // );

  return (
    <>
      <Header>
        <NetworkTypeSwitcher>
          <ButtonText
            mode="ghost"
            bgWhite
            size={isMobile ? 'small' : 'medium'}
            label={t('labels.mainNet')}
            isActive={networkType === 'main'}
            onClick={() => {
              setNetworkType('main');
            }}
          />
          <ButtonText
            mode="ghost"
            bgWhite
            size={isMobile ? 'small' : 'medium'}
            label={t('labels.testNet')}
            isActive={networkType === 'test'}
            onClick={() => setNetworkType('test')}
          />
        </NetworkTypeSwitcher>
        {/* TODO: Enable this once we added more chains */}
        {/* <SortFilter>
          <Dropdown
            align="end"
            sideOffset={8}
            style={{width: 234}}
            trigger={
              <ButtonText
                label={labels?.[sortFilter]?.title}
                mode="secondary"
                size={isMobile ? 'small' : 'large'}
                isActive={isOpen}
                iconRight={<IconChevronDown />}
              />
            }
            listItems={[
              {
                component: (
                  <ListItemAction
                    name="cost"
                    mode={sortFilter === 'cost' ? 'selected' : 'default'}
                    title={t('labels.networkCost')}
                    bgWhite
                  />
                ),
                callback: handleFilterChanged,
              },
              {
                component: (
                  <ListItemAction
                    name="popularity"
                    mode={sortFilter === 'popularity' ? 'selected' : 'default'}
                    title={t('labels.popularity')}
                    bgWhite
                  />
                ),
                callback: handleFilterChanged,
              },
              {
                component: (
                  <ListItemAction
                    name="security"
                    mode={sortFilter === 'security' ? 'selected' : 'default'}
                    title={t('labels.security')}
                    bgWhite
                  />
                ),
                callback: handleFilterChanged,
              },
            ]}
          />
        </SortFilter> */}
      </Header>
      <FormItem>
        {networks[networkType]['cost'].map(selectedNetwork => (
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
                // tag={index === 0 ? labels[sortFilter].tag : undefined}
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

// const SortFilter = styled.div.attrs({
//   className: 'flex items-center space-x-1.5',
// })``;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;

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
    cost: ['ethereum'],
    // cost: ['polygon', 'arbitrum', 'ethereum'],
    popularity: ['polygon', 'ethereum', 'arbitrum'],
    security: ['ethereum', 'arbitrum', 'polygon'],
  },
  test: {
    cost: ['goerli'],
    // cost: ['mumbai', 'arbitrum-test', 'goerli'],
    popularity: ['mumbai', 'goerli', 'arbitrum-test'],
    security: ['goerli', 'arbitrum-test', 'mumbai'],
  },
};
