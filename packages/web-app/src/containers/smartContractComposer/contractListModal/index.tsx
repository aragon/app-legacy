import {
  ButtonIcon,
  ButtonText,
  IconChevronLeft,
  IconClose,
  IconHome,
  IconMenuVertical,
} from '@aragon/ui-components';
import React from 'react';
import {useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import BottomSheet from 'components/bottomSheet';
import useScreen from 'hooks/useScreen';
import {SmartContract} from 'utils/types';
import ActionListGroup from '../components/actionListGroup';
import SmartContractListGroup from '../components/smartContractListGroup';
import DesktopModal from '../desktopModal';
import {ActionSearchInput} from '../desktopModal/header';
import {ListItemContract} from '../components/listItemContract';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
  onBackButtonClicked: () => void;
};

const SmartContractList: React.FC<Props> = props => {
  const {t} = useTranslation();
  const {isDesktop} = useScreen();

  const selectedSC: SmartContract = useWatch({name: 'selectedSC'});

  if (isDesktop)
    return (
      <DesktopModal
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
        {selectedSC ? (
          <div>
            <ListItemContract
              key={selectedSC.address}
              title={selectedSC.name}
              subtitle={`${selectedSC.actions.length} Actions to compose`}
              bgWhite
              logo={selectedSC.logo}
              iconRight={<IconMenuVertical />}
            />
            <ActionListGroup
              actions={selectedSC.actions.filter(
                a =>
                  a.type === 'function' &&
                  (a.stateMutability === 'payable' ||
                    a.stateMutability === 'nonpayable')
              )}
            />
          </div>
        ) : (
          <>
            <SmartContractListGroup />
            <ButtonText
              mode="secondary"
              size="large"
              label={t('scc.labels.connect')}
              onClick={props.onConnect}
              className="w-full"
            />
          </>
        )}
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
  const {setValue} = useFormContext();
  const selectedSC: SmartContract = useWatch({name: 'selectedSC'});

  return (
    <Header>
      {selectedSC ? (
        <ButtonIcon
          mode="secondary"
          size="small"
          icon={<IconChevronLeft />}
          bgWhite
          onClick={() => {
            setValue('selectedSC', null);
            setValue('selectedAction', null);
          }}
        />
      ) : (
        <ButtonIcon mode="secondary" size="small" icon={<IconHome />} bgWhite />
      )}

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
})`
  max-height: 70vh;
`;
