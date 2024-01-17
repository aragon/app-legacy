import {Button, Icon, IconType, Switch, Toggle, ToggleGroup} from '@aragon/ods';
import {
  ButtonIcon,
  ButtonText,
  IconClose,
  IconReload,
  Modal,
} from '@aragon/ods-old';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import BottomSheet from 'components/bottomSheet';
import {useFollowedDaosInfiniteQuery} from 'hooks/useFollowedDaos';
import useScreen from 'hooks/useScreen';
import {useWallet} from 'hooks/useWallet';
import {OrderDirection} from 'services/aragon-backend/domain/ordered-request';
import {useDaos} from 'services/aragon-backend/queries/use-daos';
import {SupportedNetworks} from 'utils/constants';
import {
  QuickFilterValue,
  governanceFilters,
  networkFilters,
  quickFilters,
} from './data';
import {DaoFilterAction, DaoFilterState, FilterActionTypes} from './reducer';

export const DEFAULT_FILTERS: DaoFilterState = {
  quickFilter: 'allDaos',
  pluginNames: ['token-voting-repo', 'multisig-repo'],
  networks: ['ethereum'],
  order: 'tvl',
  showTestnets: false,
};

type DaoFilterModalProps = {
  isOpen: boolean;
  filters: DaoFilterState;
  onClose: () => void;
  onFilterChange: React.Dispatch<DaoFilterAction>;
};

const DaoFilterModal: React.FC<DaoFilterModalProps> = ({
  isOpen,
  filters,
  onClose,
  onFilterChange,
}) => {
  const {isDesktop} = useScreen();
  const {address, isConnected} = useWallet();

  const showFollowedDaos = filters.quickFilter === 'following' && isConnected;

  const followedApi = useFollowedDaosInfiniteQuery(
    {
      pluginNames: filters.pluginNames,
      networks: filters.networks,
    },
    {enabled: showFollowedDaos}
  );

  const newDaosApi = useDaos(
    {
      direction: OrderDirection.ASC,
      orderBy: 'CREATED_AT' as const,
      pluginNames: filters.pluginNames,
      networks: filters.networks,
      // ...(filters.quickFilter === 'memberOf' && address
      //   ? {memberAddress: address.toLowerCase()}
      //   : {}),
    },
    {enabled: showFollowedDaos === false}
  );

  const daosApi = showFollowedDaos ? followedApi : newDaosApi;

  const showAllResults =
    filters.quickFilter === 'allDaos' &&
    !filters.networks?.length &&
    !filters.pluginNames?.length;

  const Component = isDesktop ? StyledModal : BottomSheet;
  return (
    <Component isOpen={isOpen} onClose={onClose}>
      <Header onClose={onClose} />
      <ModalContent filters={filters} onFilterChange={onFilterChange} />
      <ModalFooter
        count={daosApi.data?.pages[0].total ?? 0}
        onClose={onClose}
        showAll={showAllResults}
        isLoading={daosApi.isLoading}
        onFilterChange={onFilterChange}
      />
    </Component>
  );
};

export default DaoFilterModal;

type HeaderProps = {
  onClose: () => void;
};
const Header: React.FC<HeaderProps> = ({onClose}) => {
  const {t} = useTranslation();

  return (
    <ModalHeader>
      <p className="flex-1 font-semibold text-neutral-600 ft-text-lg">
        {t('explore.modal.filterDAOs.title')}
      </p>
      <ButtonIcon
        icon={<IconClose />}
        className="lg:hidden"
        mode="secondary"
        size="small"
        bgWhite
        onClick={onClose}
      />
      <ButtonIcon
        icon={<IconClose />}
        className="hidden lg:block"
        mode="secondary"
        size="large"
        bgWhite
        onClick={onClose}
      />
    </ModalHeader>
  );
};

type ContentProps = Pick<DaoFilterModalProps, 'filters' | 'onFilterChange'>;

const ModalContent: React.FC<ContentProps> = ({
  filters: {networks, quickFilter, governanceIds, showTestnets},
  onFilterChange,
}) => {
  const {t} = useTranslation();
  const {isConnected} = useWallet();

  const testnetsFilters = networkFilters.flatMap(f =>
    f.testnet ? f.value : []
  );

  const displayedChains = showTestnets
    ? networkFilters
    : networkFilters.filter(f => !f.testnet);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const toggleQuickFilters = (value?: string | string[]) => {
    if (value && !Array.isArray(value)) {
      onFilterChange({
        type: FilterActionTypes.SET_QUICK_FILTER,
        payload: value as QuickFilterValue,
      });
    }
  };

  const toggleNetworks = (value?: string[]) => {
    onFilterChange({
      type: FilterActionTypes.SET_NETWORKS,
      payload: value as SupportedNetworks[] | undefined,
    });
  };

  const toggleTestnets = (value: boolean) => {
    if (value === false) {
      const newValue = networks?.filter(
        network => !testnetsFilters.includes(network)
      );

      onFilterChange({
        type: FilterActionTypes.SET_NETWORKS,
        payload: newValue,
      });
    }

    onFilterChange({type: FilterActionTypes.TOGGLE_TESTNETS, payload: value});
  };

  const toggleGovernanceIds = (value?: string[]) => {
    onFilterChange({
      type: FilterActionTypes.SET_GOVERNANCE_IDS,
      payload: value,
    });
  };

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <Main>
      {/* Quick Filters */}
      <FilterSection>
        <ToggleGroup
          isMultiSelect={false}
          value={quickFilter}
          onChange={toggleQuickFilters}
        >
          {quickFilters.map(f => {
            return (
              <Toggle
                key={f.value}
                label={t(f.label)}
                value={f.value}
                disabled={
                  (f.value === 'memberOf' || f.value === 'following') &&
                  !isConnected
                }
              />
            );
          })}
        </ToggleGroup>
      </FilterSection>

      {/* Blockchain Filters */}
      <FilterSection>
        <TitleWrapper>
          <Title>
            <Icon icon={IconType.BLOCKCHAIN} />
            <TitleLabel>
              {t('explore.modal.filterDAOs.label.blockchains')}
            </TitleLabel>
          </Title>
          <LineDiv />
        </TitleWrapper>
        <ToggleGroup isMultiSelect value={networks} onChange={toggleNetworks}>
          {displayedChains.flatMap(f => (
            <Toggle key={f.value} label={t(f.label)} value={f.value} />
          ))}
        </ToggleGroup>
        <Switch
          checked={showTestnets}
          onCheckedChanged={toggleTestnets}
          label={t('explore.modal.filterDAOS.label.showTesnets')}
        />
      </FilterSection>

      {/* Governance Filters */}
      <FilterSection>
        <TitleWrapper>
          <Title>
            <Icon icon={IconType.APP_GOVERNANCE} />
            <TitleLabel>
              {t('explore.modal.filterDAOs.label.governanceType')}
            </TitleLabel>
          </Title>
          <LineDiv />
        </TitleWrapper>
        <ToggleGroup
          isMultiSelect
          onChange={toggleGovernanceIds}
          value={governanceIds}
        >
          {governanceFilters.map(f => (
            <Toggle key={f.value} label={t(f.label)} value={f.value} />
          ))}
        </ToggleGroup>
      </FilterSection>
    </Main>
  );
};

type FooterProps = Pick<DaoFilterModalProps, 'onClose' | 'onFilterChange'> & {
  count: number;
  showAll: boolean;
  isLoading: boolean;
};
const ModalFooter: React.FC<FooterProps> = props => {
  const {t} = useTranslation();

  let label;
  let noDaosFound = false;

  if (props.isLoading) {
    label = t('explore.modal.filterDAOs.ctaLoading');
  } else if (props.showAll) {
    label = t('explore.modal.filterDAOs.ctaLabel.seeAll');
  } else if (props.count === 0) {
    label = t('explore.modal.filterDAOs.ctaLabel.see0');
    noDaosFound = true;
  } else {
    label = t('explore.modal.filterDAOs.ctaLabel.see{{amount}}', {
      amount: props.count,
    });
  }

  const handleSeeResultsClick = () => {
    if (!props.isLoading && !noDaosFound) {
      props.onClose();
    }
  };

  const handleClearFilters = () => {
    props.onFilterChange({
      type: FilterActionTypes.RESET,
      payload: DEFAULT_FILTERS,
    });
  };

  return (
    <Footer>
      <Button
        size="lg"
        variant="primary"
        {...(props.isLoading ? {state: 'loading'} : {})}
        {...(noDaosFound ? {state: 'disabled'} : {})}
        onClick={handleSeeResultsClick}
      >
        {label}
      </Button>
      <ButtonText
        size="large"
        mode="ghost"
        label={t('explore.modal.filterDAOs.buttonLabel.clearFilters')}
        bgWhite
        onClick={handleClearFilters}
        iconLeft={<IconReload />}
        className="w-full lg:w-auto"
      />
    </Footer>
  );
};

const FilterSection = styled.div.attrs({
  className: 'space-y-3 lg:space-y-4',
})``;

const Main = styled.div.attrs({
  className: 'py-6 px-4 space-y-6 lg:space-y-10 lg:px-6',
})``;

const Footer = styled.div.attrs({
  className:
    'gap-y-3 border-t border-neutral-100 p-4 lg:px-6 flex flex-col lg:flex-row lg:gap-x-4 lg:border-none',
})``;

const TitleWrapper = styled.div.attrs({
  className: 'flex items-center gap-x-6',
})``;

const Title = styled.div.attrs({
  className: 'flex items-center gap-x-2 text-neutral-400',
})``;

const TitleLabel = styled.span.attrs({
  className: 'text-neutral-600 truncate text-sm leading-tight lg:text-base',
})``;

const LineDiv = styled.div.attrs({className: 'h-0.25 flex-1 bg-neutral-100'})``;

const ModalHeader = styled.div.attrs({
  className: `flex items-center space-x-3 lg:space-x-4 rounded-2xl bg-neutral-0 p-4 lg:px-6 lg:rounded-[0px] lg:shadow-none
    shadow-[0px_4px_8px_rgba(31,41,51,0.04),_0px_0px_2px_rgba(31,41,51,0.06),_0px_0px_1px_rgba(31,41,51,0.04)]`,
})``;

const StyledModal = styled(Modal).attrs({
  style: {
    position: 'fixed',
    display: 'flex',
    flexDirection: 'column',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: 12,
    width: '720px',
    outline: 'none',
    overflow: 'auto',
    boxShadow: `0px 24px 32px rgba(31, 41, 51, 0.04),
       0px 16px 24px rgba(31, 41, 51, 0.04),
       0px 4px 8px rgba(31, 41, 51, 0.04),
       0px 0px 1px rgba(31, 41, 51, 0.04)`,
  },
})``;
