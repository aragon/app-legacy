import React from 'react';
import {styled} from 'styled-components';
import {ButtonText} from '../button';
import {CardToken, type CardTokenProps} from './cardToken';
import {CardTransfer, type CardTransferProps} from './cardTransfer';

export type CardExecutionProps = CardTransferProps & {
  /**
   * Title of the card
   */
  title: string;
  /**
   * Description text
   */
  description: string;
  /**
   * Allows the Execution Card component grow horizontally
   * */
  wide?: boolean;
  /** Handler for the switch button. Will be called when the button is clicked.
   * */
  onClick?: () => void;
  /**
   * whether the action button is disabled or not
   */
  disabledAction?: boolean;
} & Omit<
    CardTokenProps,
    | 'type'
    | 'bgWhite'
    | 'changeType'
    | 'tokenUSDValue'
    | 'changeDuringInterval'
    | 'treasurySharePercentage'
    | 'percentageChangeDuringInterval'
  >;

export const CardExecution: React.FC<CardExecutionProps> = ({
  title,
  description,
  to,
  from,
  toLabel,
  fromLabel,
  toLinkURL,
  fromLinkURL,
  tokenName,
  tokenImageUrl,
  tokenSymbol,
  tokenCount,
  treasuryShare,
  onClick,
  disabledAction = true,
  wide = false,
}: CardExecutionProps) => {
  return (
    <Card wide={wide} data-testid="cardExecution">
      <Header>
        <Title>{title}</Title>
        <Description>{description}</Description>
      </Header>
      <Content>
        <CardTransfer
          {...{to, from, toLabel, fromLabel, toLinkURL, fromLinkURL}}
          bgWhite
        />
        <CardToken
          {...{
            tokenName,
            tokenImageUrl,
            tokenSymbol,
            tokenCount,
            treasuryShare,
          }}
          type="transfer"
          bgWhite
        />
      </Content>
      <Action>
        <ButtonText
          label="Execute Now"
          onClick={onClick}
          {...(disabledAction && {disabled: true})}
        />
      </Action>
    </Card>
  );
};

type CardProps = Pick<CardExecutionProps, 'wide'>;

const Card = styled.div.attrs<CardProps>(({wide}) => ({
  className: `${
    wide ? 'flex justify-between' : 'w-84'
  } flex-col bg-neutral-0 rounded-xl p-6 space-y-6`,
}))<CardProps>``;

const Header = styled.div.attrs({
  className: 'flex flex-col space-y-2',
})``;

const Title = styled.h2.attrs({
  className: 'text-neutral-800 font-semibold text-3xl leading-tight',
})``;

const Description = styled.p.attrs({
  className: 'text-neutral-600 font-normal text-normal',
})``;

const Content = styled.div.attrs({
  className: 'flex flex-col space-y-3',
})``;

const Action = styled.div.attrs({
  className: 'flex',
})``;
