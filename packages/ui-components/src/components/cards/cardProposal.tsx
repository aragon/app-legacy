import React from 'react';
import styled from 'styled-components';

import {Badge} from '../badge';
import {LinearProgress} from '../progress';
import {Address, shortenAddress} from '../../utils/addresses';
import {Link} from '../link';
import {AvatarDao} from '../avatar';
import {IconClock} from '../icons';
import {AlertInline} from '../alerts';

type ProposalUsecase = 'list' | 'explore';

export function isExploreProposal(
  proposalUsecase: ProposalUsecase
): proposalUsecase is 'explore' {
  return proposalUsecase === 'explore';
}

export type CardProposalProps = {
  /** Proposal Title / Title of the card */
  title: string;
  /** Proposal Description / Description of the card */
  description: string;
  /**
   * Will be called when the button is clicked.
   * */
  onClick: () => void;
  /**
   * Available states that proposal card have. by changing the status,
   * the headers & buttons wil change to proper format also the progress
   * section only available on active state.
   * */
  process:
    | 'draft'
    | 'pending'
    | 'active'
    | 'succeeded'
    | 'executed'
    | 'defeated';
  /** Indicates whether the proposal is in being used in list or in its special form (see explore page) */
  type?: ProposalUsecase;
  /** Url for the dao avatar */
  daoLogo?: 'string';
  /** The title that appears at the top of the progress bar */
  voteTitle: string;
  /** Progress bar value in percentage (max: 100) */
  voteProgress?: number | string;
  /** Vote label that appears at bottom of the progress bar */
  voteLabel?: string;
  /** Proposal token amount */
  tokenAmount?: string;
  /** Proposal token symbol */
  tokenSymbol?: string;
  /** Publish by sentence in any available languages */
  publishLabel: string;
  /** Publisher's ethereum address, ENS name **or** DAO address when type is explore */
  publisherAddress?: Address;
  /** DAO name to display when type is explore */
  daoName?: string;
  /** Blockchain explorer URL */
  explorer?: string;

  alertMessage?: string;
  /**
   * ['Draft', 'Pending', 'Active', 'Executed', 'Succeeded', 'Defeated']
   */
  stateLabel: string[];
};

export const CardProposal: React.FC<CardProposalProps> = ({
  process = 'pending',
  title,
  description,
  voteTitle,
  voteProgress,
  voteLabel,
  tokenAmount,
  tokenSymbol,
  publishLabel,
  publisherAddress,
  explorer = 'https://etherscan.io/',
  alertMessage,
  stateLabel,
  type = 'list',
  daoLogo,
  daoName,
  onClick,
}: CardProposalProps) => {
  const adressExploreUrl = `${explorer}address/${publisherAddress}`;

  return (
    <Card data-testid="cardProposal" onClick={onClick}>
      <Header>
        <HeaderOptions
          process={process}
          stateLabel={stateLabel}
          alertMessage={alertMessage}
          type={type}
        />
      </Header>
      <TextContent>
        <Title>{title}</Title>
        <Description>{description}</Description>
        <Publisher>
          {isExploreProposal(type) ? (
            <AvatarDao daoName={daoName!} size="small" src={daoLogo} />
          ) : (
            <PublisherLabel>{publishLabel}</PublisherLabel>
          )}

          <Link
            external
            href={adressExploreUrl}
            label={shortenAddress(
              (isExploreProposal(type) ? daoName : publisherAddress) || ''
            )}
            className="text-sm"
          />
        </Publisher>
      </TextContent>
      {process === 'active' && (
        <LoadingContent>
          <ProgressInfoWrapper>
            <ProgressTitle>{voteTitle}</ProgressTitle>
            <TokenAmount>
              {tokenAmount} {tokenSymbol}
            </TokenAmount>
          </ProgressInfoWrapper>
          <LinearProgress max={100} value={voteProgress} />
          <ProgressInfoWrapper>
            <Vote>{voteLabel}</Vote>
            <Percentage>{voteProgress}%</Percentage>
          </ProgressInfoWrapper>
        </LoadingContent>
      )}
    </Card>
  );
};

type HeaderOptionProps = Pick<
  CardProposalProps,
  'alertMessage' | 'process' | 'stateLabel'
> & {
  type: NonNullable<CardProposalProps['type']>;
};

const HeaderOptions: React.VFC<HeaderOptionProps> = ({
  alertMessage,
  process,
  stateLabel,
  type,
}) => {
  switch (process) {
    case 'draft':
      return <Badge label={stateLabel[0]} />;
    case 'pending':
      return (
        <>
          <Badge label={stateLabel[1]} />
          {alertMessage && (
            <AlertInline
              label={alertMessage}
              icon={<IconClock className="text-info-500" />}
              mode="neutral"
            />
          )}
        </>
      );
    case 'active':
      return (
        <>
          {!isExploreProposal(type) && (
            <Badge label={stateLabel[2]} colorScheme={'info'} />
          )}
          {alertMessage && (
            <AlertInline
              label={alertMessage}
              icon={<IconClock className="text-info-500" />}
              mode="neutral"
            />
          )}
        </>
      );
    case 'executed':
      return <Badge label={stateLabel[3]} colorScheme={'success'} />;
    case 'succeeded':
      return <Badge label={stateLabel[4]} colorScheme={'success'} />;
    case 'defeated':
      return <Badge label={stateLabel[5]} colorScheme={'critical'} />;
    default:
      return null;
  }
};

const Card = styled.button.attrs({
  className:
    'w-full bg-white rounded-xl p-2 space-y-3 box-border ' +
    'hover:border hover:border-ui-100 ' +
    'active:border active:border-ui-200 ' +
    'focus:outline-none focus:ring-2 focus:ring-primary-500',
})`
  &:hover {
    box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
      0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
  }
`;

const Header = styled.div.attrs({
  className: 'flex justify-between',
})``;

const Title = styled.p.attrs({
  className: 'text-ui-800 text-left font-bold ft-text-xl',
})``;

const Description = styled.p.attrs({
  className: 'text-ui-600 text-left font-normal ft-text-base line-clamp-2',
})``;

const Publisher = styled.span.attrs({
  className: 'flex space-x-1 text-ui-500 ft-text-sm',
})``;

const TextContent = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const LoadingContent = styled.div.attrs({
  className: 'space-y-2 p-2 bg-ui-50 rounded-xl',
})``;

const ProgressInfoWrapper = styled.div.attrs({
  className: 'flex justify-between',
})``;

const ProgressTitle = styled.h3.attrs({
  className: 'text-ui-800 ft-text-base font-bold',
})``;

const TokenAmount = styled.span.attrs({
  className: 'text-ui-500 ft-text-sm',
})``;

const Vote = styled.span.attrs({
  className: 'text-primary-500 font-bold ft-text-base',
})``;

const Percentage = styled.span.attrs({
  className: 'text-primary-500 font-bold ft-text-base',
})``;

const PublisherLabel = styled.p.attrs({className: '-mr-0.5'})``;
