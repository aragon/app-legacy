import {AvatarDao, ButtonText, Spinner, Tag} from '@aragon/ods';
import {SessionTypes} from '@walletconnect/types';
import React, {useCallback, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import ModalHeader from 'components/modalHeader';
import {useActionsContext} from 'context/actions';
import {useNetwork} from 'context/network';
import useScreen from 'hooks/useScreen';
import {
  WcActionRequest,
  useWalletConnectInterceptor,
} from 'hooks/useWalletConnectInterceptor';
import {getEtherscanVerifiedContract} from 'services/etherscanAPI';
import {addABI, decodeMethod} from 'utils/abiDecoder';
import {attachEtherNotice} from 'utils/contract';
import {
  getEncodedActionInputs,
  getWCEncodedFunctionName,
  getWCNativeToField,
  parseWCIconUrl,
} from 'utils/library';

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
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {isDesktop} = useScreen();

  const {setValue, resetField} = useFormContext();
  const {addAction, removeAction} = useActionsContext();

  const [actionsReceived, setActionsReceived] = useState<WcActionRequest[]>([]);

  const onActionRequest = useCallback(
    (request: WcActionRequest) => {
      setActionsReceived([...actionsReceived, request]);
    },
    [actionsReceived]
  );

  const {wcDisconnect} = useWalletConnectInterceptor({onActionRequest});

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleAddActions = useCallback(async () => {
    resetField(`actions.${actionIndex}`);

    // NOTE: this is slightly inefficient and can be optimized
    // by wrapping the map in a Promise.all, but there might be an
    // even better solution. I am unsure if the getEtherscanVerifiedContract
    // will always be ran with the same parameters given each batch of actions
    // will be coming from only one dApp at a time. If that is indeed
    // the case, then both the Etherscan data and notices can be fetched
    // and parsed outside of the loop, getting rid of the unnecessary
    // async requests. F.F. - [07-10-2023]
    for (const {action, index: currentIndex} of actionsReceived.map(
      (action, index) => ({
        action,
        index,
      })
    )) {
      // verify and decode
      const etherscanData = await getEtherscanVerifiedContract(
        action.params[0].to,
        network
      );

      // increment the index so multiple actions can be added at once
      const index = actionIndex + currentIndex;

      // name, raw action and contract address set on every action
      addAction({name: 'wallet_connect_action'});
      setValue(`actions.${index}.name`, 'wallet_connect_action');
      setValue(`actions.${index}.raw`, action.params[0]);
      setValue(`actions.${index}.contractAddress`, action.params[0].to);

      // fill out the wallet connect action based on verification/encoded status
      if (
        etherscanData.status === '1' &&
        etherscanData.result[0].ABI !== 'Contract source code not verified'
      ) {
        setValue(`actions.${index}.verified`, true);

        addABI(JSON.parse(etherscanData.result[0].ABI));
        const decodedData = decodeMethod(action.params[0].data);

        if (decodedData) {
          //verified & decoded, use decoded params
          setValue(`actions.${index}.decoded`, true);
          setValue(
            `actions.${index}.contractName`,
            etherscanData.result[0].ContractName
          );
          setValue(`actions.${index}.functionName`, decodedData.name);

          // get notices using etherscan abi parser
          const notices = attachEtherNotice(
            etherscanData.result[0].SourceCode,
            etherscanData.result[0].ContractName,
            JSON.parse(etherscanData.result[0].ABI)
          ).find(notice => notice.name === decodedData.name);

          // attach notice to input
          const inputs = decodedData.params.map(param => {
            return {
              ...param,
              notice: notices?.inputs.find(
                notice =>
                  notice.name === param.name && notice.type === param.type
              )?.notice,
            };
          });

          // add payable field as it is NOT present on the method itself
          if (action.params[0].value) {
            inputs.push(getWCNativeToField(t, action.params[0].value, network));
          }
          setValue(`actions.${index}.inputs`, [...inputs]);
          setValue(`actions.${actionIndex}.notice`, notices?.notice);
        } else {
          // Verified but failed to decode
          setValue(`actions.${index}.decoded`, false);
          setValue(
            `actions.${index}.contractName`,
            etherscanData.result[0].ContractName
          );

          setValue(
            `actions.${index}.functionName`,
            getWCEncodedFunctionName(action.method)
          );
          setValue(
            `actions.${index}.inputs`,
            getEncodedActionInputs(action.params[0], network, t)
          );
        }
      } else {
        // unverified & encoded
        setValue(`actions.${index}.decoded`, false);
        setValue(`actions.${index}.verified`, false);
        setValue(`actions.${index}.contractName`, action.params[0].to);
        setValue(
          `actions.${index}.functionName`,
          getWCEncodedFunctionName(action.method)
        );

        setValue(
          `actions.${index}.inputs`,
          getEncodedActionInputs(action.params[0], network, t)
        );
      }
    }

    removeAction(actionIndex);
  }, [
    actionIndex,
    actionsReceived,
    addAction,
    network,
    removeAction,
    resetField,
    setValue,
    t,
  ]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (!isOpen) {
    return null;
  }

  const metadataName = selectedSession.peer.metadata.name;
  const metadataURL = selectedSession.peer.metadata.url;
  const metadataIcon = parseWCIconUrl(
    metadataURL,
    selectedSession.peer.metadata.icons[0]
  );

  return (
    <ModalBottomSheetSwitcher isOpen={isOpen} onClose={onClose}>
      <ModalHeader
        title={metadataName}
        showBackButton
        onBackButtonClicked={onBackButtonClicked}
        {...(isDesktop ? {showCloseButton: true, onClose} : {})}
      />
      <Content>
        <div className="flex flex-col items-center space-y-1.5">
          <AvatarDao daoName={metadataName} src={metadataIcon} size="medium" />
          <div className="flex justify-center items-center font-bold text-center text-ui-800">
            <Spinner size={'xs'} />
            <p className="ml-2">{t('wc.detaildApp.spinnerLabel')}</p>
          </div>
          <p className="desktop:px-5 text-sm text-center text-ui-500">
            {t('wc.detaildApp.desc', {
              dappName: metadataName,
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
              dappName: metadataName,
            })}
            onClick={() => window.open(metadataURL, '_blank')}
            mode="ghost"
            bgWhite
            className="w-full"
          />
          <ButtonText
            label={t('wc.detaildApp.ctaLabel.disconnectdApp', {
              dappName: metadataName,
            })}
            onClick={async () => {
              await wcDisconnect(selectedSession.topic);
              onBackButtonClicked();
            }}
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
