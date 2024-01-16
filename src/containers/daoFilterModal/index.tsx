import {Button, Icon, IconType, Switch, Toggle, ToggleGroup} from '@aragon/ods';
import {
  ButtonIcon,
  ButtonText,
  IconClose,
  IconReload,
  Modal,
} from '@aragon/ods-old';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import BottomSheet from 'components/bottomSheet';
import useScreen from 'hooks/useScreen';
import {useWallet} from 'hooks/useWallet';
import {SupportedNetworks} from 'utils/constants';
import {
  QuickFilterValue,
  networkFilters,
  governanceFilters,
  quickFilters,
} from './data';
import {DaoFilterState} from './reducer';

type DaoFilterModalProps = DaoFilterState & {
  count: number;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onClearFilters: () => void;
  onQuickFilterChanged: (value: QuickFilterValue) => void;
  onNetworkFiltersChanged: (value: SupportedNetworks[] | undefined) => void;
  onGovernanceFiltersChanged: (value: string[] | undefined) => void;
};

const DaoFilterModal: React.FC<DaoFilterModalProps> = ({
  count,
  isOpen,
  networks,
  isLoading,
  quickFilter,
  governanceIds,
  onClose,
  onClearFilters,
  onQuickFilterChanged,
  onNetworkFiltersChanged,
  onGovernanceFiltersChanged,
}) => {
  const {isDesktop} = useScreen();
  const Component = isDesktop ? StyledModal : BottomSheet;

  const showAllResults =
    quickFilter === 'allDaos' && !networks?.length && !governanceIds?.length;

  return (
    <Component isOpen={isOpen} onClose={onClose}>
      <Header onClose={onClose} />
      <ModalContent
        networks={networks}
        quickFilter={quickFilter}
        governanceIds={governanceIds}
        onQuickFilterChanged={onQuickFilterChanged}
        onNetworkFiltersChanged={onNetworkFiltersChanged}
        onGovernanceFiltersChanged={onGovernanceFiltersChanged}
      />
      <ModalFooter
        count={count}
        onClose={onClose}
        showAll={showAllResults}
        isLoading={isLoading}
        onClearFilters={onClearFilters}
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

type ContentProps = Pick<
  DaoFilterModalProps,
  | 'networks'
  | 'quickFilter'
  | 'governanceIds'
  | 'onQuickFilterChanged'
  | 'onNetworkFiltersChanged'
  | 'onGovernanceFiltersChanged'
>;

const ModalContent: React.FC<ContentProps> = props => {
  const {t} = useTranslation();
  const {isConnected} = useWallet();

  const [showTestnets, setShowTestnets] = useState(false);

  const testnetsFilters = networkFilters.flatMap(f =>
    f.testnet ? f.value : []
  );

  const displayedChains = showTestnets
    ? networkFilters
    : networkFilters.filter(f => !f.testnet);

  const toggleTestnets = (value: boolean) => {
    if (value === false) {
      const newValue = props.networks?.filter(
        network => !testnetsFilters.includes(network)
      );

      props.onNetworkFiltersChanged(newValue);
    }

    setShowTestnets(value);
  };

  return (
    <Main>
      {/* Quick Filters */}
      <FilterSection>
        <ToggleGroup
          isMultiSelect={false}
          value={props.quickFilter}
          onChange={v => {
            if (v) {
              props.onQuickFilterChanged(v as QuickFilterValue);
            }
          }}
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
        <ToggleGroup
          isMultiSelect
          value={props.networks}
          onChange={v =>
            props.onNetworkFiltersChanged(v as SupportedNetworks[] | undefined)
          }
        >
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
          onChange={props.onGovernanceFiltersChanged}
          value={props.governanceIds}
        >
          {governanceFilters.map(f => (
            <Toggle key={f.value} label={t(f.label)} value={f.value} />
          ))}
        </ToggleGroup>
      </FilterSection>
    </Main>
  );
};

type FooterProps = Pick<
  DaoFilterModalProps,
  'isLoading' | 'count' | 'onClearFilters' | 'onClose'
> & {
  showAll: boolean;
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
        onClick={props.onClearFilters}
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
    'gap-y-3 border-t border-neutral-100 p-4 flex flex-col lg:flex-row lg:gap-x-4 lg:border-none',
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
  className:
    'flex items-center space-x-3 lg:space-x-4 rounded-2xl bg-neutral-0 p-4',
})`
  box-shadow:
    0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;

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
