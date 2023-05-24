import {
  ButtonIcon,
  ButtonText,
  IconChevronLeft,
  IconClose,
  IconFeedback,
  IconHome,
  Link,
} from '@aragon/ui-components';
import React, {useEffect, useState} from 'react';
import {useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import BottomSheet from 'components/bottomSheet';
import {SmartContract} from 'utils/types';
import ActionListGroup from '../components/actionListGroup';
import SmartContractListGroup from '../components/smartContractListGroup';
import {ActionSearchInput} from '../desktopModal/header';
import {trackEvent} from 'services/analytics';
import {useParams} from 'react-router-dom';
import InputForm from '../components/inputForm';
import {SccFormData} from '..';
import {ListHeaderContract} from '../components/listHeaderContract';
import {actionsFilter} from 'utils/contract';

type Props = {
  isOpen: boolean;
  actionIndex: number;
  onClose: () => void;
  onConnectNew: () => void;
  onBackButtonClicked: () => void;
  onComposeButtonClicked: (addAnother: boolean) => void;
  onRemoveContract: (address: string) => void;
};

const MobileModal: React.FC<Props> = props => {
  const {t} = useTranslation();
  const {dao: daoAddressOrEns} = useParams();
  const {setValue} = useFormContext();
  const [isActionSelected, setIsActionSelected] = useState(false);

  const [selectedSC]: [SmartContract] = useWatch({
    name: ['selectedSC'],
  });
  const [search, setSearch] = useState('');
  const {getValues} = useFormContext<SccFormData>();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const contracts = getValues('contracts') || [];
  const autoSelectedContract = contracts.length === 1 ? contracts[0] : null;

  useEffect(() => {
    setValue('selectedSC', autoSelectedContract);
  }, [autoSelectedContract, setValue]);

  return (
    <BottomSheet isOpen={props.isOpen} onClose={props.onClose}>
      <CustomMobileHeader
        onClose={props.onClose}
        onBackButtonClicked={() => {
          if (isActionSelected) {
            setValue('selectedAction', null);
            setIsActionSelected(false);
          } else if (selectedSC !== null) {
            setValue('selectedSC', null);
          } else {
            props.onBackButtonClicked();
          }
        }}
        onSearch={setSearch}
      />
      <Content>
        {!isActionSelected ? (
          selectedSC ? (
            <div>
              <ListHeaderContract
                key={selectedSC.address}
                sc={selectedSC}
                onRemoveContract={props.onRemoveContract}
              />
              <ActionListGroup
                actions={selectedSC.actions.filter(actionsFilter(search))}
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
              <Link
                external
                type="primary"
                iconRight={<IconFeedback height={13} width={13} />}
                href={t('scc.listContracts.learnLinkURL')}
                label={t('scc.listContracts.learnLinkLabel')}
                className="justify-center w-full"
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
  onSearch: (search: string) => void;
};
const CustomMobileHeader: React.FC<CustomHeaderProps> = props => {
  const {t} = useTranslation();
  const selectedSC: SmartContract = useWatch({name: 'selectedSC'});

  return (
    <Header>
      {selectedSC ? (
        <ButtonIcon
          mode="secondary"
          size="small"
          icon={<IconChevronLeft />}
          bgWhite
          onClick={props.onBackButtonClicked}
        />
      ) : (
        <ButtonIcon mode="secondary" size="small" icon={<IconHome />} bgWhite />
      )}

      <ActionSearchInput
        type="text"
        placeholder={t('scc.labels.searchPlaceholder')}
        onChange={ev => props.onSearch(ev.target.value)}
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
