import {
  ButtonIcon,
  CardText,
  CardToken,
  CardTransfer,
  IconChevronRight,
  IconClose,
  IconLinkExternal,
  ListItemAction,
} from '@aragon/ui-components';
import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {InstalledPluginListItem} from '@aragon/sdk-client';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useNetwork} from 'context/network';
import {useTransactionDetailContext} from 'context/transactionDetail';
import {useDaoProposal} from 'hooks/useDaoProposal';
import {PluginTypes} from 'hooks/usePluginClient';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import {trackEvent} from 'services/analytics';
import {CHAIN_METADATA, TransferTypes} from 'utils/constants';
import {Proposal} from 'utils/paths';
import {abbreviateTokenAmount} from 'utils/tokens';
import {Withdraw} from 'utils/types';

type TransactionDetailProps = {
  daoName: string;
  daoPlugin: InstalledPluginListItem;
};

const TransactionDetail: React.FC<TransactionDetailProps> = ({
  daoName,
  daoPlugin,
}) => {
  const {t} = useTranslation();
  const {dao} = useParams();
  const navigate = useNavigate();

  const {network} = useNetwork();

  const {isOpen, transfer, onClose} = useTransactionDetailContext();

  const transactionUrl = `
    ${CHAIN_METADATA[network].explorer}tx/${transfer.transaction}`;
  const proposalId = (transfer as Withdraw).proposalId;

  const {data: proposal} = useDaoProposal(
    proposalId,
    daoPlugin.instanceAddress,
    daoPlugin.id as PluginTypes
  );

  const handleNavigateToProposal = useCallback(() => {
    navigate(
      generatePath(Proposal, {
        network,
        dao,
        id: proposalId,
      })
    );
    onClose();
  }, [dao, navigate, network, onClose, proposalId]);

  return (
    <ModalBottomSheetSwitcher isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <Title>{t('transactionDetail.title')}</Title>
        <ButtonIcon
          mode="secondary"
          size="small"
          bgWhite
          icon={<IconClose />}
          onClick={onClose}
        />
      </ModalHeader>

      <Content>
        <CardTransfer
          {...(transfer.transferType === TransferTypes.Deposit
            ? {to: daoName, from: transfer.sender}
            : {to: transfer.to, from: daoName})}
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
                title={proposal?.metadata.title || 'Loading...'}
                subtitle="Linked Proposal"
                iconRight={<IconChevronRight />}
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
                dao_address: dao,
              })
            }
          >
            <ListItemAction
              title={t('transactionDetail.viewTransaction')}
              iconRight={<IconLinkExternal />}
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
    'flex items-center space-between h-10 gap-x-3 p-2 bg-ui-0 rounded-xl sticky top-0',
})`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const Content = styled.div.attrs({className: 'p-3 space-y-1.5'})`
  max-width: 448px;
`;

const Title = styled.p.attrs({
  className: 'flex-1 text-ui-800 font-bold',
})``;
