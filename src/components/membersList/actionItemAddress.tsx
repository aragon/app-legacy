import React from 'react';
import styled from 'styled-components';
import {
  useScreen,
  shortenAddress,
  Avatar,
  ButtonIcon,
  Dropdown,
  ListItemProps,
  IconLinkExternal,
  IconMenuVertical,
  Tag,
} from '@aragon/ods';

/**
 * Type declarations for `ActionItemAddressProps`.
 */
export type ActionItemAddressProps = {
  /** Wallet address or ENS domain name. */
  addressOrEns: string;

  /** Optional ENS avatar URL. If not provided and the wallet address is valid,
   *  it will be used to generate a Blockies avatar.
   */
  avatar?: string;

  /** Number of delegations. */
  delegations?: number;

  /** List of dropdown menu options. */
  menuOptions?: ListItemProps[];

  /** Optional click handler for the "view on-chain" action. */
  onViewOnChainClick?: React.MouseEventHandler;

  /** Optional label for the wallet tag. */
  tagLabel?: string;

  /** Number of tokens delegated. */
  tokenAmount?: number;

  /** Symbol of the token delegated. */
  tokenSymbol?: string;

  /** Total supply of the token */
  tokenSupply?: number;

  /** ID variant for the wallet, which can be 'delegate' or 'you'. */
  walletId?: TagWalletIdProps['variant'];
};

/**
 * `ActionItemAddress` component: Displays an address item with associated actions.
 * @param props - Component properties following `ActionItemAddressProps` type.
 * @returns JSX Element.
 */
export const ActionItemAddress: React.FC<ActionItemAddressProps> = props => {
  const {
    addressOrEns,
    avatar,
    delegations,
    menuOptions,
    onViewOnChainClick,
    tokenSupply,
    tagLabel,
    tokenAmount,
    tokenSymbol,
    walletId,
  } = props;

  const {isDesktop} = useScreen();

  const supplyPercentage =
    tokenSupply && tokenAmount
      ? ((tokenAmount / tokenSupply) * 100).toFixed(2)
      : undefined;

  return (
    <Container>
      <Avatar size="small" mode="circle" src={avatar ?? addressOrEns} />

      <ContentWrapper>
        <Wallet>
          <AddressOrEns>{shortenAddress(addressOrEns)}</AddressOrEns>
          {walletId && tagLabel && (
            <TagWalletId
              label={tagLabel}
              variant={walletId}
              className="inline-flex relative -top-0.5 -right-0.5"
            />
          )}
        </Wallet>
        <Content>
          <InfoWrapper>
            <span>{tokenAmount}</span>
            <span>{tokenSymbol}</span>
            <InfoLabel>({supplyPercentage}%)</InfoLabel>
          </InfoWrapper>
          <InfoWrapper>
            {delegations != null && delegations > 0 && (
              <>
                <span>{delegations}</span>
                <InfoLabel>Delegations</InfoLabel>
              </>
            )}
          </InfoWrapper>
        </Content>
      </ContentWrapper>
      <ButtonGroup>
        {isDesktop && (
          <ButtonIcon
            mode="ghost"
            icon={<IconLinkExternal />}
            size="small"
            bgWhite
            onClick={onViewOnChainClick}
          />
        )}

        {menuOptions != null && (
          <Dropdown
            align="end"
            alignOffset={isDesktop ? 0 : -4}
            className="py-1 px-0"
            listItems={menuOptions}
            side="top"
            sideOffset={isDesktop ? -40 : -44}
            trigger={
              <ButtonIcon
                mode="secondary"
                icon={<IconMenuVertical />}
                size="small"
                bgWhite
              />
            }
          />
        )}
      </ButtonGroup>
    </Container>
  );
};

export const TAG_WALLET_ID_VARIANTS = ['delegate', 'you'] as const;
type TagWalletIdVariant = typeof TAG_WALLET_ID_VARIANTS[number];

/**
 * Type declarations for `TagWalletIdProps`.
 */
type TagWalletIdProps = {
  /** Optional CSS classes to apply to the tag. */
  className?: string;
  /** Label to display on the tag. */
  label: string;
  /** Variant of the tag which affects its color. Can be 'delegate' or 'you'. */
  variant: TagWalletIdVariant;
};

/**
 * `TagWalletId` component: Displays a styled tag based on the provided variant.
 * @param props - Component properties following `TagWalletIdProps` type.
 * @returns JSX Element.
 */
const TagWalletId: React.FC<TagWalletIdProps> = ({
  className,
  label,
  variant,
}) => {
  const colorScheme = variant === 'you' ? 'neutral' : 'info';
  return <Tag label={label} colorScheme={colorScheme} className={className} />;
};

const Container = styled.div.attrs({
  className:
    'bg-ui-0 flex py-2 items-center px-1.5 desktop:pr-2 desktop:pl-3 space-x-2 w-full border-b border-b-ui-100',
})``;

const ContentWrapper = styled.div.attrs({
  className: 'desktop:flex flex-1 space-y-0.5',
})``;

const Content = styled.div.attrs({
  className:
    'flex desktop:flex-1 space-x-1.5 font-semibold text-ui-600 ft-text-sm',
})``;

const InfoWrapper = styled.div.attrs({
  className: 'flex desktop:flex-1 space-x-0.25',
})``;

const InfoLabel = styled.span.attrs({className: 'font-normal text-ui-500'})``;

const Wallet = styled.div.attrs({
  className: 'flex desktop:flex-1 items-center',
})``;

const AddressOrEns = styled.div.attrs({
  className: 'font-semibold text-ui-800 ft-text-base',
})``;

const ButtonGroup = styled.div.attrs({className: 'flex gap-x-1.5'})``;
