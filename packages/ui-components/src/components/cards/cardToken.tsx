import styled from 'styled-components';
import React, {SyntheticEvent} from 'react';

import {Tag} from '../tag';
import FallbackImg from '../../assets/avatar-token.svg';

export type CardTokenProps = {
  tokenName: string;
  tokenSymbol: string;
  tokenImageUrl: string;
  treasurySharePercentage?: string;
  tokenCount: number | string;
  tokenUSDValue?: string;
  treasuryShare?: string;
  type?: 'vault' | 'transfer';
  bgWhite?: boolean;
  changeType?: 'Positive' | 'Negative';
  changeDuringInterval?: string;
  percentageChangeDuringInterval?: string;
};

// TODO: when refactoring, separate returns for vault and transfer
export const CardToken: React.FC<CardTokenProps> = ({
  type = 'vault',
  bgWhite = false,
  changeType = 'Positive',
  ...props
}) => {
  const isVault = type === 'vault';

  return (
    <Card data-testid="cardToken" bgWhite={bgWhite}>
      <CoinDetailsWithImage>
        <CoinImage
          src={props.tokenImageUrl}
          onError={(e: SyntheticEvent<HTMLImageElement, Event>) => {
            e.currentTarget.src = FallbackImg;
          }}
        />
        <CoinDetails>
          <CoinNameAndAllocation>
            <CoinName>{props.tokenName}</CoinName>
            <ToggleMobileVisibility visible={false}>
              {props.treasurySharePercentage && isVault && (
                <Tag label={props.treasurySharePercentage} />
              )}
            </ToggleMobileVisibility>
          </CoinNameAndAllocation>
          {isVault && (
            <SecondaryCoinDetails>
              <div className="flex space-x-0.5">
                <div className="truncate">{props.tokenCount}</div>{' '}
                <div>{props.tokenSymbol}</div>
              </div>
              {props.tokenUSDValue && (
                <ToggleMobileVisibility visible={false}>
                  <span>•</span>
                  <span> {props.tokenUSDValue}</span>
                </ToggleMobileVisibility>
              )}
            </SecondaryCoinDetails>
          )}
        </CoinDetails>
      </CoinDetailsWithImage>
      <MarketProperties>
        <FiatValue>
          {isVault ? (
            <div className="truncate">{props.treasuryShare}</div>
          ) : (
            <div className="flex space-x-0.5">
              <div className="truncate">{props.tokenCount}</div>{' '}
              <div>{props.tokenSymbol}</div>
            </div>
          )}
        </FiatValue>

        <SecondaryFiatDetails>
          {isVault ? (
            <>
              {props.changeDuringInterval && (
                <ToggleMobileVisibility visible={false}>
                  <span
                    className={
                      changeType === 'Positive'
                        ? 'text-success-800'
                        : 'text-critical-800'
                    }
                  >
                    {props.changeDuringInterval}
                  </span>
                </ToggleMobileVisibility>
              )}
              {props.percentageChangeDuringInterval && (
                <Tag
                  label={props.percentageChangeDuringInterval}
                  colorScheme={
                    changeType === 'Positive' ? 'success' : 'critical'
                  }
                />
              )}
            </>
          ) : (
            props.treasuryShare
          )}
        </SecondaryFiatDetails>
      </MarketProperties>
    </Card>
  );
};

type CardProps = Pick<CardTokenProps, 'bgWhite'>;

const Card = styled.div.attrs(({bgWhite}: CardProps) => ({
  className: `flex justify-between space-x-4 items-center py-2.5 px-3 overflow-hidden ${
    bgWhite ? 'bg-ui-50' : 'bg-ui-0'
  } rounded-xl`,
}))<CardProps>``;

const CoinDetailsWithImage = styled.div.attrs({
  className: 'flex items-center flex-auto',
})``;

const CoinImage = styled.img.attrs(({src}) => ({
  className: 'w-3 h-3 tablet:h-5 tablet:w-5 rounded-full',
  src,
}))``;

const CoinDetails = styled.div.attrs({
  className: 'ml-2 space-y-1 overflow-hidden',
})``;

const CoinNameAndAllocation = styled.div.attrs({
  className: 'flex items-start space-x-1',
})``;

const CoinName = styled.h1.attrs({
  className: 'font-bold text-ui-800 truncate',
})``;

const SecondaryCoinDetails = styled.div.attrs({
  className: 'ft-text-sm text-ui-500 space-x-0.5 tablet:flex',
})``;

const MarketProperties = styled.div.attrs({
  className: 'text-right space-y-1 flex-auto overflow-hidden',
})``;

const FiatValue = styled.h1.attrs({
  className: 'font-bold text-ui-800',
})``;

const SecondaryFiatDetails = styled.div.attrs({
  className:
    'ft-text-sm text-ui-500 space-x-1 flex justify-end items-center truncate',
})``;

type ToggleMobileVisibilityProps = {
  visible: boolean;
};

const ToggleMobileVisibility: React.FC<ToggleMobileVisibilityProps> = ({
  visible,
  children,
}) => {
  return (
    <div
      className={
        visible ? 'inline-block tablet:hidden' : 'hidden tablet:inline-block'
      }
    >
      {children}
    </div>
  );
};
