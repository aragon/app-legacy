import React, {useCallback} from 'react';
import {
  CardText,
  CardToken,
  CardTransfer,
  ListItemAction,
} from '@aragon/ods-old';
import {Button, Icon, IconType} from '@aragon/ods';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useNetwork} from 'context/network';
import {useTransactionDetailContext} from 'context/transactionDetail';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {PluginTypes} from 'hooks/usePluginClient';
import {trackEvent} from 'services/analytics';
import {useProposal} from 'services/aragon-sdk/queries/use-proposal';
import {CHAIN_METADATA, TransferTypes} from 'utils/constants';
import {toDisplayEns} from 'utils/library';
import {Proposal} from 'utils/paths';
import {abbreviateTokenAmount} from 'utils/tokens';
import {Withdraw} from 'utils/types';

const TransactionDetail: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork();

  const {data: daoDetails} = useDaoDetailsQuery();
  const {address = '', ensDomain, metadata, plugins} = daoDetails ?? {};
  const {name: daoName = ''} = metadata ?? {};

  const {isOpen, transfer, onClose} = useTransactionDetailContext();

  const explorerURL = CHAIN_METADATA[network].explorer;
  const transactionUrl = ` ${explorerURL}tx/${transfer.transaction}`;
  const proposalId =
    transfer.transferType === TransferTypes.Withdraw
      ? (transfer as Withdraw).proposalId
      : undefined;

  const daoExplorerURL = `${explorerURL}address/${address}`;
  const transferDaoName = toDisplayEns(ensDomain) || daoName;

  const {data: proposal} = useProposal({
    pluginType: plugins?.[0].id as PluginTypes,
    id: proposalId?.toString() ?? '',
  });

  const handleNavigateToProposal = useCallback(() => {
    navigate(
      generatePath(Proposal, {
        network,
        dao: toDisplayEns(ensDomain) ?? daoName,
        id: proposalId!.toUrlSlug(), // only called for Withdrawals
      })
    );
    onClose();
  }, [ensDomain, daoName, navigate, network, onClose, proposalId]);

  return (
    <ModalBottomSheetSwitcher isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <Title>{t('transactionDetail.title')}</Title>
        <Button
          variant="secondary"
          size="sm"
          iconLeft={IconType.CLOSE}
          onClick={onClose}
        />
      </ModalHeader>

      <Content>
        <CardTransfer
          {...(transfer.transferType === TransferTypes.Deposit
            ? {
                to: transferDaoName,
                toLinkURL: daoExplorerURL,
                from: transfer.sender,
                fromLinkURL: `${explorerURL}address/${transfer.sender}`,
              }
            : {
                to: transfer.to,
                toLinkURL: `${explorerURL}address/${transfer.to}`,
                from: transferDaoName,
                fromLinkURL: daoExplorerURL,
              })}
          toLabel={t('labels.to')}
          fromLabel={t('labels.from')}
        />
        <CardToken
          type="transfer"
          tokenName={transfer.tokenName}
          tokenCount={`${
            transfer.transferType === TransferTypes.Deposit ? '+' : '-'
          } ${abbreviateTokenAmount(transfer.tokenAmount)}`}
          tokenSymbol={transfer.tokenSymbol}
          tokenImageUrl={transfer.tokenImgUrl}
          treasuryShare={transfer.usdValue}
        />

        {transfer.transferType === TransferTypes.Deposit
          ? transfer.reference && (
              <CardText
                type="label"
                title={t('labels.reference')}
                content={transfer.reference}
              />
            )
          : transfer.transferType === TransferTypes.Withdraw && (
              <ListItemAction
                title={proposal?.metadata.title || t('labels.loading')}
                subtitle="Linked Proposal"
                iconRight={<Icon icon={IconType.CHEVRON_RIGHT} />}
                onClick={handleNavigateToProposal}
              />
            )}

        <div>
          <a
            href={transactionUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              trackEvent('finance_viewInBlockExplorer_clicked', {
                transaction_hash: transfer.id,
                dao_address: address,
              })
            }
          >
            <ListItemAction
              title={t('transactionDetail.viewTransaction')}
              iconRight={<Icon icon={IconType.LINK_EXTERNAL} />}
            />
          </a>
        </div>
      </Content>
    </ModalBottomSheetSwitcher>
  );
};

export default TransactionDetail;

const ModalHeader = styled.div.attrs({
  className:
    'flex items-center space-between h-20 gap-x-6 p-4 bg-neutral-0 rounded-xl sticky top-0',
})`
  box-shadow:
    0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06),
    0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const Content = styled.div.attrs({className: 'p-6 space-y-3'})``;

const Title = styled.p.attrs({
  className: 'flex-1 text-neutral-800 font-semibold',
})``;
