import React, {type ButtonHTMLAttributes, type FC} from 'react';
import {styled} from 'styled-components';

import {useScreen} from '../../hooks';
import {shortenAddress} from '../../utils/addresses';
import {AvatarWallet} from '../avatar';
import {IconLinkExternal, IconPerson} from '../icons';
import type {TagProps} from '../tag';
import {Tag} from '../tag';

type TokenInfo = {
  amount: number | string;
  symbol: string;
  percentage?: number | string;
};

export type ListItemVoterProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string | null;
  /**
   * String representing EITHER a wallet address OR an ens name.
   */
  src: string | null;
  /**
   * Optional token information. Consists of a token amount, symbol and share.
   */
  tokenInfo?: TokenInfo;
  option?: 'yes' | 'abstain' | 'no' | 'approved' | 'none';
  walletTag?: TagProps;
  voteReplaced?: boolean;
  voteReplacedLabel?: string;
  onClick: () => void;
};

const colorScheme = (option: string) =>
  option === 'yes' || option === 'approved'
    ? 'success'
    : option === 'no'
    ? 'critical'
    : 'neutral';

export const ListItemVoter: FC<ListItemVoterProps> = ({
  label,
  src,
  tokenInfo,
  option,
  walletTag,
  voteReplaced,
  voteReplacedLabel,
  ...props
}) => {
  const {isMobile} = useScreen();

  return (
    <Container data-testid="listItem-voter" {...props}>
      <LeftSection>
        {!isMobile && <Avatar src={src ?? ''} />}
        <LeftContent>
          <p className="flex font-semibold text-neutral-800 ft-text-base">
            {shortenAddress(label)}
            {walletTag && <Tag {...walletTag} className="mx-2" />}
          </p>
          <p className="flex font-semibold text-neutral-600 ft-text-sm">
            {tokenInfo?.amount} {tokenInfo?.symbol}
          </p>
        </LeftContent>
      </LeftSection>

      <RightSection>
        <RightContent>
          {option && (
            <Tag
              label={option}
              className="capitalize"
              colorScheme={colorScheme(option)}
            />
          )}
          {voteReplaced && (
            <p className="text-neutral-600 ft-text-xs">{voteReplacedLabel}</p>
          )}
        </RightContent>
        {!isMobile && (
          <span className="px-3">
            <IconLinkExternal />
          </span>
        )}
      </RightSection>
    </Container>
  );
};

type AvatarProps = Pick<ListItemVoterProps, 'src'>;

const Avatar: FC<AvatarProps> = ({src}) => {
  if (!src) {
    return <IconPerson className="h-5 w-5" />;
  }
  return <AvatarWallet src={src} />;
};

const Container = styled.button.attrs(() => {
  const baseLayoutClasses =
    'flex items-center justify-between w-full border-neutral-100 border-b-2';
  const baseStyleClasses = 'bg-neutral-0 pl-4 pr-3 py-3 ';
  let className:
    | string
    | undefined = `${baseLayoutClasses} ${baseStyleClasses}`;

  const focusVisibleClasses =
    'focus-visible:ring-0 focus-visible:ring-[transparent]';
  const hoverClasses = 'hover:text-primary-500 hover:shadow-neutral';
  const activeClasses = 'active:outline-none active:border-neutral-200';

  className += ` text-neutral-600 ${focusVisibleClasses} ${activeClasses} ${hoverClasses}`;

  return {className};
})``;

const LeftSection = styled.div.attrs({
  className: 'flex items-center space-x-3',
})``;
const LeftContent = styled.div.attrs({className: 'space-y-1'})``;
const RightContent = styled.div.attrs({
  className: 'flex flex-col items-end space-y-1',
})``;
const RightSection = styled.div.attrs({
  className: 'flex space-x-3 items-center ft-text-sm',
})``;
