import React, {type ReactElement, type ReactNode} from 'react';
import {styled} from 'styled-components';

import {shortenAddress} from '../../utils/addresses';
import {AlertInline} from '../alerts';
import {AvatarDao} from '../avatar';
import {IconClock, IconUpdate} from '../icons';
import {LinearProgress} from '../progress';
import {Tag} from '../tag';

type ProposalUseCase = 'list' | 'explore';

export function isExploreProposal(
  proposalUseCase: ProposalUseCase
): proposalUseCase is 'explore' {
  return proposalUseCase === 'explore';
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
    | 'approved'
    | 'executed'
    | 'defeated';
  /** Indicates whether the proposal is in being used in list or in its special form (see explore page) */
  type?: ProposalUseCase;
  /** Url for the dao avatar */
  daoLogo?: 'string';
  /** The title that appears at the top of the progress bar */
  voteTitle: string;
  /** Progress bar value in percentage (max: 100) */
  voteProgress?: number | string;
  /** Vote label that appears at bottom of the progress bar */
  voteLabel?: string;
  /** Label indicating that current user has voted */
  votedAlertLabel?: string;
  /** Breakdown of the wining option */
  winningOptionValue?: string;
  /** Proposal token amount */
  tokenAmount?: string;
  /** Proposal token symbol */
  tokenSymbol?: string;
  /** Publish by sentence in any available languages */
  publishLabel: string;
  /** Publisher's ethereum address, ENS name **or** DAO address when type is
   * explore */
  publisherAddress?: string;
  /** Human readable name */
  publisherDisplayName: string;

  /** DAO name to display when type is explore */
  daoName?: string;
  /** Blockchain explorer URL */
  explorer?: string;

  alertMessage?: string;
  /**
   * ['Draft', 'Pending', 'Active', 'Executed', 'Succeeded', 'Approved', 'Defeated']
   */
  stateLabel: string[];

  /** Ability to display card banner, nothing passed === banner hidden */
  bannerContent?: ReactNode;
  /** Select the icon you want to accompany the banner  */
  bannerIcon?: ReactElement;
};

export const CardProposal: React.FC<CardProposalProps> = ({
  process = 'pending',
  title,
  description,
  voteTitle,
  voteProgress,
  voteLabel,
  votedAlertLabel,
  tokenAmount,
  tokenSymbol,
  winningOptionValue,
  publishLabel,
  publisherAddress,
  publisherDisplayName,
  explorer = 'https://etherscan.io/',
  alertMessage,
  stateLabel,
  type = 'list',
  daoLogo,
  daoName,
  onClick,
  bannerContent,
  bannerIcon = <IconUpdate />,
}: CardProposalProps) => {
  const addressExploreUrl = `${explorer}address/${publisherAddress}`;

  return (
    <Card data-testid="cardProposal" onClick={onClick}>
      {bannerContent && (
        <CardBanner>
          {bannerIcon}
          <div>{bannerContent}</div>
        </CardBanner>
      )}
      <CardBody>
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

            <PublisherAddress
              href={addressExploreUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {shortenAddress(
                (isExploreProposal(type) ? daoName : publisherDisplayName) ?? ''
              )}
            </PublisherAddress>
          </Publisher>
        </TextContent>
        {process === 'active' && voteProgress !== undefined && (
          <>
            <LoadingContent>
              <ProgressInfoWrapper>
                <ProgressTitle>{voteTitle}</ProgressTitle>
                <Amount>
                  {tokenAmount && tokenSymbol
                    ? `${tokenAmount} ${tokenSymbol}`
                    : winningOptionValue}
                </Amount>
              </ProgressInfoWrapper>
              <LinearProgress max={100} value={voteProgress} />
              <ProgressInfoWrapper>
                <Vote>{voteLabel}</Vote>
                <Percentage>{voteProgress}%</Percentage>
              </ProgressInfoWrapper>
            </LoadingContent>
            {votedAlertLabel && (
              <VotedAlertWrapper>
                <AlertInline mode="success" label={votedAlertLabel} />
              </VotedAlertWrapper>
            )}
          </>
        )}
      </CardBody>
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
      return <Tag label={stateLabel[0]} />;
    case 'pending':
      return (
        <>
          <Tag label={stateLabel[1]} />
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
            <Tag label={stateLabel[2]} colorScheme="info" />
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
      return <Tag label={stateLabel[3]} colorScheme="success" />;
    case 'succeeded':
      return <Tag label={stateLabel[4]} colorScheme="success" />;
    case 'approved':
      return <Tag label={stateLabel[5]} colorScheme="success" />;
    case 'defeated':
      return <Tag label={stateLabel[6]} colorScheme="critical" />;
    default:
      return null;
  }
};

const Card = styled.button.attrs({
  className:
    'w-full bg-neutral-0 rounded-xl box-border ' +
    'hover:border hover:border-neutral-100 ' +
    'active:border active:border-neutral-200 ' +
    'focus:outline-none focus:ring focus:ring-primary',
})`
  &:hover {
    box-shadow:
      0px 4px 8px rgba(31, 41, 51, 0.04),
      0px 0px 2px rgba(31, 41, 51, 0.06),
      0px 0px 1px rgba(31, 41, 51, 0.04);
  }
`;

const CardBody = styled.div.attrs({className: 'p-4 space-y-6'})``;

const CardBanner = styled.div.attrs({
  className:
    'bg-primary-400 text-primary-50 text-sm leading-normal font-semibold px-4 py-2 flex items-center gap-x-3 rounded-t-xl',
})``;

const Header = styled.div.attrs({
  className: 'flex justify-between',
})``;

const Title = styled.p.attrs({
  className: 'text-neutral-800 text-left font-semibold ft-text-xl',
})``;

const Description = styled.p.attrs({
  className: 'text-neutral-600 text-left font-normal ft-text-base line-clamp-2',
})``;

const Publisher = styled.span.attrs({
  className: 'flex space-x-2 text-neutral-500 ft-text-sm',
})``;

const TextContent = styled.div.attrs({
  className: 'space-y-3',
})``;

const LoadingContent = styled.div.attrs({
  className: 'space-y-4 p-4 bg-neutral-50 rounded-xl',
})``;

const ProgressInfoWrapper = styled.div.attrs({
  className: 'flex justify-between',
})``;

const ProgressTitle = styled.h3.attrs({
  className: 'text-neutral-800 ft-text-base font-semibold',
})``;

const Amount = styled.span.attrs({
  className: 'text-neutral-500 ft-text-base',
})``;

const Vote = styled.span.attrs({
  className: 'text-primary-500 font-semibold ft-text-base',
})``;

const Percentage = styled.span.attrs({
  className: 'text-primary-500 font-semibold ft-text-base',
})``;

const PublisherLabel = styled.p.attrs({className: '-mr-1'})``;

const VotedAlertWrapper = styled.div.attrs({
  className: 'flex justify-center xl:justify-start',
})``;

const PublisherAddress = styled.a.attrs({
  className: `font-semibold ft-text-sm text-primary-400 hover:text-primary-600 active:text-primary-800
        focus-visible:ring focus-visible:ring-primary-200 focus-visible:bg-neutral-50 `,
})``;
