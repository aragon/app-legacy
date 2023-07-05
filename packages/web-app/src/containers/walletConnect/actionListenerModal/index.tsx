import React, {useState} from 'react';
import styled from 'styled-components';
import {SessionTypes} from '@walletconnect/types';
import {useTranslation} from 'react-i18next';
import {AvatarDao, ButtonText, IconSpinner, Tag} from '@aragon/ui-components';
import {useFormContext} from 'react-hook-form';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import ModalHeader from 'components/modalHeader';
import useScreen from 'hooks/useScreen';
import {useWalletConnectInterceptor} from 'hooks/useWalletConnectInterceptor';
import {WcRequest} from 'services/walletConnectInterceptor';
import {useActionsContext} from 'context/actions';
import {getEtherscanVerifiedContract} from 'services/etherscanAPI';
import {useNetwork} from 'context/network';
import {addABI, decodeMethod} from 'utils/abiDecoder';

type Props = {
  onBackButtonClicked: () => void;
  onClose: () => void;
  isOpen: boolean;
  selectedSession: SessionTypes.Struct;
  actionIndex: number;
};

const ActionListenerModal: React.FC<Props> = ({
  onBackButtonClicked,
  onClose,
  actionIndex,
  selectedSession,
  isOpen,
}) => {
  const {isDesktop} = useScreen();
  const {network} = useNetwork();
  const {t} = useTranslation();
  const [actionsReceived, setActionsReceived] = useState<Array<WcRequest>>([]);
  const {addAction, removeAction} = useActionsContext();
  const {setValue, resetField} = useFormContext();

  function onActionRequest(request: WcRequest) {
    setActionsReceived([...actionsReceived, request]);
  }
  const {wcDisconnect} = useWalletConnectInterceptor({
    onActionRequest: onActionRequest,
  });

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleAddActions = () => {
    resetField(`actions.${actionIndex}`);

    actionsReceived.map(async action => {
      const etherscanData = await getEtherscanVerifiedContract(
        action.params[0].to,
        network
      );

      if (
        etherscanData.status === '1' &&
        etherscanData.result[0].ABI !== 'Contract source code not verified'
      ) {
        addABI(JSON.parse(etherscanData.result[0].ABI));
        const decodedData = decodeMethod(action.params[0].data);

        if (decodedData) {
          addAction({
            name: 'external_contract_action',
          });
          setValue(`actions.${actionIndex}.name`, 'wallet_connect_action');
          setValue(
            `actions.${actionIndex}.contractAddress`,
            action.params[0].to
          );
          setValue(
            `actions.${actionIndex}.contractName`,
            etherscanData.result[0].ContractName
          );
          setValue(`actions.${actionIndex}.functionName`, decodedData.name);
          setValue(`actions.${actionIndex}.inputs`, decodedData.params);
          // TODO: Add NatSpec
          // setValue(`actions.${actionIndex}.notice`, );
        } else {
          //TODO: Failed to decode flow
        }
      } else {
        //TODO: Failed to fetch ABI - failed to decode flow
      }
    });

    removeAction(actionIndex);
  };

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (!isOpen) {
    return null;
  }

  return (
    <ModalBottomSheetSwitcher isOpen={isOpen} onClose={onClose}>
      <ModalHeader
        title={selectedSession.peer.metadata.name}
        showBackButton
        onBackButtonClicked={onBackButtonClicked}
        {...(isDesktop ? {showCloseButton: true, onClose} : {})}
      />
      <Content>
        <div className="flex flex-col items-center space-y-1.5">
          <AvatarDao
            daoName={selectedSession.peer.metadata.name}
            src={selectedSession.peer.metadata.icons[0]}
            size="medium"
          />
          <div className="flex justify-center items-center font-bold text-center text-ui-800">
            <IconSpinner className="mr-2 w-1.75 desktop:w-2.5 h-1.75 desktop:h-2.5 animate-spin" />
            {t('wc.detaildApp.spinnerLabel')}
          </div>
          <p className="desktop:px-5 text-sm text-center text-ui-500">
            {t('wc.detaildApp.desc', {
              dappName: selectedSession.peer.metadata.name,
            })}
          </p>
          {actionsReceived.length > 0 ? (
            <Tag
              label={t('wc.detaildApp.amountActionsTag', {
                amountActions: actionsReceived.length,
              })}
            />
          ) : (
            <Tag label={t('wc.detaildApp.noActionsTag')} />
          )}
        </div>

        <div className="space-y-1.5">
          {actionsReceived.length > 0 ? (
            <ButtonText
              label={t('wc.detaildApp.ctaLabel.addAmountActions', {
                amountActions: actionsReceived.length,
              })}
              onClick={handleAddActions}
              mode="primary"
              className="w-full"
            />
          ) : null}
          <ButtonText
            label={t('wc.detaildApp.ctaLabel.opendApp', {
              dappName: selectedSession.peer.metadata.name,
            })}
            onClick={() =>
              window.open(selectedSession.peer.metadata.url, '_blank')
            }
            mode="ghost"
            bgWhite
            className="w-full"
          />
          <ButtonText
            label={t('wc.detaildApp.ctaLabel.disconnectdApp', {
              dappName: selectedSession.peer.metadata.name,
            })}
            onClick={() => wcDisconnect(selectedSession.topic)}
            mode="ghost"
            className="w-full"
          />
        </div>
      </Content>
    </ModalBottomSheetSwitcher>
  );
};

export default ActionListenerModal;

const Content = styled.div.attrs({
  className: 'py-3 px-2 desktop:px-3 space-y-3',
})``;
