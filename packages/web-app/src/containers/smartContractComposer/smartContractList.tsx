import {
  ButtonIcon,
  ButtonText,
  IconChevronRight,
  IconClock,
  IconClose,
  IconHome,
  ListItemAction,
} from '@aragon/ui-components';
import BottomSheet from 'components/bottomSheet';
import React from 'react';
import styled from 'styled-components';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onBackButtonClicked: () => void;
};

// TODO: Fill out as we go
type SmartContractAction = {};

type SmartContract = {
  actions: Array<SmartContractAction>;
  address: string;
  logo?: string;
  name: string;
};

// Assumption is that these will come from the form
const DUMMY_CONTRACTS: Array<SmartContract> = [
  {actions: [{}, {}], address: '0x123', logo: '', name: 'Uniswap Token'},
  {
    actions: [{}, {}, {}],
    address: '0x234',
    logo: '',
    name: 'Smart Contract Name',
  },
];

const SmartContractList: React.FC<Props> = props => {
  return (
    <BottomSheet isOpen={props.isOpen} onClose={props.onClose}>
      <CustomModalHeader onBackButtonClicked={props.onBackButtonClicked} />
      <Content>
        <ListGroup>
          <ContractNumberIndicator>
            {DUMMY_CONTRACTS.length} Connected Smart Contracts
          </ContractNumberIndicator>
          {DUMMY_CONTRACTS.map(c => (
            <ListItemAction
              key={c.address}
              title={c.name}
              subtitle={`${c.actions.length} Actions`}
              bgWhite
              iconLeft={<IconClock />}
              iconRight={<IconChevronRight />}
            />
          ))}
        </ListGroup>
        <ButtonText
          mode="secondary"
          size="large"
          label="Connect Smart Contract"
          className="w-full"
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
const CustomModalHeader: React.FC<CustomHeaderProps> = props => {
  return (
    <Header>
      <ButtonIcon mode="secondary" size="small" icon={<IconHome />} bgWhite />

      <p className="flex-1 border">Type to find any action...</p>

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
  className: 'flex items-center rounded-xl space-x-2 p-2',
})`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const Content = styled.div.attrs({className: 'py-3 px-2 space-y-3'})``;

const ListGroup = styled.div.attrs({className: 'pb-2 space-y-1'})``;

const ContractNumberIndicator = styled.div.attrs({
  className: 'ft-text-sm font-bold text-ui-400',
})``;
