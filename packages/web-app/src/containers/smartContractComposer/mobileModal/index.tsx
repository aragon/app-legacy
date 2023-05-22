import {
  ButtonIcon,
  ButtonText,
  IconChevronLeft,
  IconClose,
  IconHome,
  IconMenuVertical,
} from '@aragon/ui-components';
import React, {useState} from 'react';
import {useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import BottomSheet from 'components/bottomSheet';
import {SmartContract} from 'utils/types';
import ActionListGroup from '../components/actionListGroup';
import SmartContractListGroup from '../components/smartContractListGroup';
import {ActionSearchInput} from '../desktopModal/header';
import {ListItemContract} from '../components/listItemContract';
import {trackEvent} from 'services/analytics';
import {useParams} from 'react-router-dom';
import InputForm from '../components/inputForm';

type Props = {
  isOpen: boolean;
  actionIndex: number;
  onClose: () => void;
  onConnectNew: () => void;
  onBackButtonClicked: () => void;
  onComposeButtonClicked: () => void;
};

const MobileModal: React.FC<Props> = props => {
  const {t} = useTranslation();
  const {dao: daoAddressOrEns} = useParams();
  const [isActionSelected, setIsActionSelected] = useState(false);

  const [selectedSC]: [SmartContract] = useWatch({
    name: ['selectedSC'],
  });

  return (
    <BottomSheet isOpen={props.isOpen} onClose={props.onClose}>
      <CustomMobileHeader
        onClose={props.onClose}
        onBackButtonClicked={() => {
          if (isActionSelected) {
            setIsActionSelected(false);
          } else {
            props.onBackButtonClicked();
          }
        }}
      />
      <Content>
        {!isActionSelected ? (
          selectedSC ? (
            <div>
              <ListItemContract
                key={selectedSC.address}
                title={selectedSC.name}
                subtitle={`${
                  selectedSC.actions.filter(
                    a =>
                      a.type === 'function' &&
                      (a.stateMutability === 'payable' ||
                        a.stateMutability === 'nonpayable')
                  ).length
                } Actions to compose`}
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
                onActionSelected={() => setIsActionSelected(true)}
              />
            </div>
          ) : (
            <>
              <SmartContractListGroup />
              <ButtonText
                mode="secondary"
                size="large"
                label={t('scc.labels.connect')}
                onClick={() => {
                  trackEvent('newProposal_connectSmartContract_clicked', {
                    dao_address: daoAddressOrEns,
                  });
                  props.onConnectNew();
                }}
                className="w-full"
              />
            </>
          )
        ) : (
          selectedSC && (
            <InputForm
              actionIndex={props.actionIndex}
              onComposeButtonClicked={props.onComposeButtonClicked}
            />
          )
        )}
      </Content>
    </BottomSheet>
  );
};

export default MobileModal;

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
            setValue('selectedAction', null);
            props.onBackButtonClicked();
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
        onClick={props.onClose}
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
