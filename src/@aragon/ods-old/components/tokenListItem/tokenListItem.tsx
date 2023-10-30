import React from 'react';
import {styled} from 'styled-components';
import {Avatar} from '../avatar';

export type TokenListItemProps = {
  /**
   * name of the token
   */
  tokenName: string;
  /**
   * Symbol of the token
   */
  tokenSymbol: string;
  /**
   * Amount of the token
   */
  tokenAmount: string | number;
  /**
   * src of token logo
   */
  tokenLogo: string;
  /**
   * Whether list item is disabled
   */
  disabled?: boolean;
  /**
   *  change the background
   */
  bgWhite?: boolean;
  onClick?: () => void;
};

export const TokenListItem: React.FC<TokenListItemProps> = ({
  tokenName,
  tokenSymbol,
  tokenAmount,
  tokenLogo,
  disabled,
  bgWhite,
  onClick,
}) => {
  return (
    <Container {...{onClick, disabled, bgWhite}} data-testid="tokenListItem">
      <TextWrapper>
        <Avatar src={tokenLogo} size="small" />
        <Name>{tokenName}</Name>
      </TextWrapper>
      <AmountWrapper>
        {tokenAmount} {tokenSymbol}
      </AmountWrapper>
    </Container>
  );
};

type StyledContentProps = Pick<TokenListItemProps, 'bgWhite'>;

const Container = styled.button.attrs<StyledContentProps>(({bgWhite}) => ({
  className: `w-full flex justify-between items-center py-3
  px-4 hover:text-neutral-800 hover:bg-neutral-100 active:text-neutral-800
  text-neutral-600 active:bg-neutral-200 disabled:text-neutral-300
  disabled:text-neutral-300 disabled:bg-neutral-100 rounded-xl
  ${bgWhite ? 'bg-neutral-50' : 'bg-neutral-0'}`,
}))``;

const AmountWrapper = styled.h3.attrs({
  className: 'font-normal ft-text-base',
})``;

const TextWrapper = styled.div.attrs({
  className: 'flex space-x-4',
})``;

const Name = styled.h2.attrs({
  className: 'font-semibold ft-text-base',
})``;
