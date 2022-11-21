import {
  ButtonIcon,
  ButtonText,
  IconClose,
  IconHome,
} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import BottomSheet from 'components/bottomSheet';
import useScreen from 'hooks/useScreen';
import SmartContractListGroup from '../components/smartContractListGroup';
import DesktopModal from '../desktopModal';
import {ActionSearchInput} from '../desktopModal/header';

// Assumption is that these will come from the form;
// temporarily passing them down
const DUMMY_CONTRACTS = [
  {actions: [{}, {}], address: '0x123', logo: '', name: 'Uniswap Token'},
  // {actions: [{}, {}], address: '0x123', logo: '', name: 'Uniswap Token'},
  // {actions: [{}, {}], address: '0x123', logo: '', name: 'Uniswap Token'},
  // {actions: [{}, {}], address: '0x123', logo: '', name: 'Uniswap Token'},
  // {actions: [{}, {}], address: '0x123', logo: '', name: 'Uniswap Token'},
  // {actions: [{}, {}], address: '0x123', logo: '', name: 'Uniswap Token'},
  // {actions: [{}, {}], address: '0x123', logo: '', name: 'Uniswap Token'},

  {
    actions: [{}, {}, {}],
    address: '0x234',
    logo: '',
    name: 'Smart Contract Name',
  },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
  onBackButtonClicked: () => void;
};

const SmartContractList: React.FC<Props> = props => {
  const {t} = useTranslation();
  const {isDesktop} = useScreen();

  if (isDesktop)
    return (
      <DesktopModal
        contracts={DUMMY_CONTRACTS}
        isOpen={props.isOpen}
        onClose={props.onClose}
        onConnect={props.onConnect}
        onBackButtonClicked={props.onBackButtonClicked}
      />
    );

  // mobile modal
  return (
    <BottomSheet isOpen={props.isOpen} onClose={props.onClose}>
      <CustomMobileHeader onBackButtonClicked={props.onBackButtonClicked} />
      <Content>
        <SmartContractListGroup contracts={DUMMY_CONTRACTS} />
        <ButtonText
          mode="secondary"
          size="large"
          label={t('scc.labels.connect')}
          className="w-full"
          onClick={props.onConnect}
        />
      </Content>
    </BottomSheet>
  );
};

export default SmartContractList;

type CustomHeaderProps = {
  onBackButtonClicked: () => void;
  onClose?: () => void;
};
const CustomMobileHeader: React.FC<CustomHeaderProps> = props => {
  const {t} = useTranslation();

  return (
    <Header>
      <ButtonIcon mode="secondary" size="small" icon={<IconHome />} bgWhite />

      <ActionSearchInput
        type="text"
        placeholder={t('scc.labels.searchPlaceholder')}
      />

      <ButtonIcon
        mode="secondary"
        size="small"
        icon={<IconClose />}
        onClick={props.onBackButtonClicked}
        bgWhite
      />
    </Header>
  );
};

const Header = styled.div.attrs({
  className: 'flex items-center rounded-xl space-x-2 p-2 bg-ui-0',
})`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const Content = styled.div.attrs({
  className: 'py-3 px-2 space-y-3 overflow-auto',
})``;
