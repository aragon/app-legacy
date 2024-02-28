import React from 'react';
import {styled} from 'styled-components';
import {Icon, IconType, Spinner} from '@aragon/ods';

export type TransferListItemProps = {
  isPending?: boolean;
  /**
   * Transfer title corresponding to the transfer reference or transfer type
   */
  title: string;
  /**
   * Number of tokens transferred
   */
  tokenAmount: string | number;
  tokenSymbol: string;
  /**
   * Date transfer was executed or a loading indication if transfer is still pending
   */
  transferDate: string;
  transferType: 'VaultDeposit' | 'VaultWithdraw';
  usdValue: string;
  onClick?: () => void;
};

const Icons: {[key: string]: JSX.Element} = {
  VaultDeposit: (
    <Icon
      icon={IconType.DEPOSIT}
      className="h-3 w-3 text-success-600 xl:h-4 xl:w-4"
    />
  ),
  Pending: <Spinner className="h-3 w-3 text-primary-500 xl:h-4 xl:w-4" />,
  VaultWithdraw: (
    <Icon
      icon={IconType.WITHDRAW}
      className="h-3 w-3 text-warning-600 xl:h-4 xl:w-4"
    />
  ),
};

const bgColors: {[key: string]: string} = {
  VaultDeposit: 'bg-success-100',
  Pending: 'bg-primary-50',
  VaultWithdraw: 'bg-warning-100',
};

export const TransferListItem: React.FC<TransferListItemProps> = ({
  isPending = false,
  title,
  tokenAmount,
  tokenSymbol,
  transferDate,
  transferType,
  usdValue,
  onClick,
}) => {
  return (
    <Container data-testid="transferListItem" onClick={onClick}>
      <AvatarContainer
        bgColor={isPending ? bgColors.Pending : bgColors[transferType]}
      >
        {isPending ? Icons.Pending : Icons[transferType]}
      </AvatarContainer>
      <Content>
        <Title>{title}</Title>
        <Date>{transferDate}</Date>
      </Content>
      <Value>
        <USDValue>{`${
          transferType === 'VaultDeposit' ? '+' : '-'
        } ${tokenAmount} ${tokenSymbol}`}</USDValue>
        <TokenAmount>{usdValue}</TokenAmount>
      </Value>
      <Icon
        icon={IconType.CHEVRON_RIGHT}
        className="text-neutral-300 group-hover:text-primary-500"
      />
    </Container>
  );
};

const Container = styled.button.attrs({
  className: `group w-full px-4 xl:px-6 py-3 xl:py-5 bg-neutral-0 rounded-xl
  flex items-center space-x-4 focus:outline-none focus-visible:ring focus-visible:ring-primary active:bg-neutral-100`,
})``;

const AvatarContainer = styled.div.attrs<{bgColor: string}>(({bgColor}) => ({
  className: `flex items-center justify-center w-6 h-6 ${bgColor} rounded xl:w-10 xl:h-10 xl:rounded-xl`,
}))<{bgColor: string}>``;

const Content = styled.div.attrs({
  className: 'flex-1 text-left min-w-0',
})``;

const Title = styled.p.attrs({
  className:
    'font-semibold text-neutral-800 group-hover:text-primary-500 truncate',
})``;

const Date = styled.p.attrs({
  className: 'ft-text-sm text-neutral-500',
})``;

const Value = styled.div.attrs({
  className: 'text-right',
})``;

const USDValue = styled.p.attrs({
  className: 'font-semibold text-neutral-800',
})``;

const TokenAmount = styled.p.attrs({
  className: 'ft-text-sm text-neutral-500',
})``;
