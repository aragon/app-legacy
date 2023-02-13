import {Tag} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {abbreviateTokenAmount} from 'utils/tokens';
import {VotingTerminalProps} from '.';

const NumberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

type Props = Pick<
  VotingTerminalProps,
  | 'strategy'
  | 'supportThreshold'
  | 'minParticipation'
  | 'currentParticipation'
  | 'missingParticipation'
  | 'startDate'
  | 'endDate'
  | 'status'
> & {
  currentApprovals?: number;
  memberCount?: number;
  minApproval?: number;
  minimumReached?: boolean;
  missingApprovalOrParticipation: number;
  uniqueVoters?: number;
  voteOptions: string;
};

const InfoTab: React.FC<Props> = ({
  currentApprovals,
  currentParticipation,
  endDate,
  memberCount,
  minApproval,
  minimumReached,
  minParticipation,
  missingApprovalOrParticipation = 0,
  voteOptions,
  startDate,
  status,
  strategy,
  supportThreshold,
  uniqueVoters,
}) => {
  const {t} = useTranslation();

  return (
    <>
      <VStackSection>
        <SectionHeader>{t('votingTerminal.decision')}</SectionHeader>
        <InfoLine>
          <p>{t('votingTerminal.options')}</p>
          <Strong>{voteOptions}</Strong>
        </InfoLine>
        <InfoLine>
          <p>{t('votingTerminal.strategy')}</p>
          <Strong>{strategy}</Strong>
        </InfoLine>

        {/* Support threshold */}
        {supportThreshold !== undefined && (
          <InfoLine>
            <p>{t('votingTerminal.supportThreshold')}</p>
            <Strong>{`> ${supportThreshold}%`}</Strong>
          </InfoLine>
        )}
        {/* Minimum part */}
        {minParticipation && (
          <InfoLine>
            <p>{t('votingTerminal.minParticipation')}</p>
            <Strong>{`≥ ${minParticipation}`}</Strong>
          </InfoLine>
        )}

        {/* Min approval */}
        {minApproval !== undefined && (
          <InfoLine>
            <p>{t('labels.minimumApproval')}</p>
            <Strong>
              {t('votingTerminal.ofAddressCount', {
                value: minApproval,
                total: memberCount,
              })}
            </Strong>
          </InfoLine>
        )}
      </VStackSection>

      <VStackSection>
        <SectionHeader>{t('votingTerminal.activity')}</SectionHeader>

        {/* Token Voting Current Participation */}
        {currentParticipation && (
          <InfoLine>
            <p className="flex-1">{t('votingTerminal.currentParticipation')}</p>

            <CurrentParticipationWrapper>
              <Strong>{currentParticipation}</Strong>
              <div className="flex gap-x-1 justify-end">
                {minimumReached && (
                  <Tag
                    label={t('votingTerminal.reached')}
                    colorScheme="success"
                  />
                )}
                <p className="text-right text-ui-400 ft-text-sm">
                  {minimumReached
                    ? t('votingTerminal.noVotesMissing')
                    : t('votingTerminal.missingVotes', {
                        votes: abbreviateTokenAmount(
                          parseFloat(
                            missingApprovalOrParticipation.toFixed(2)
                          ).toString()
                        ),
                      })}
                </p>
              </div>
            </CurrentParticipationWrapper>
          </InfoLine>
        )}

        {/* Multisig current approvals */}
        {currentApprovals !== undefined && minApproval && memberCount && (
          <InfoLine>
            <p className="flex-1">{t('votingTerminal.currentApproval')}</p>

            <CurrentParticipationWrapper>
              <Strong>
                {`${t('votingTerminal.ofAddressCount', {
                  value: currentApprovals,
                  total: minApproval,
                })} (${NumberFormatter.format(
                  (currentApprovals / minApproval) * 100
                )}%)`}
              </Strong>
              <div className="flex gap-x-1 justify-end">
                {minimumReached && (
                  <Tag
                    label={t('votingTerminal.reached')}
                    colorScheme="success"
                  />
                )}
                <p className="text-right text-ui-400 ft-text-sm">
                  {minimumReached
                    ? t('votingTerminal.noApprovalsMissing')
                    : t('votingTerminal.missingApprovals', {
                        approvals: missingApprovalOrParticipation,
                      })}
                </p>
              </div>
            </CurrentParticipationWrapper>
          </InfoLine>
        )}
        {uniqueVoters !== undefined && (
          <InfoLine>
            <p>{t('votingTerminal.uniqueVoters')}</p>
            <Strong>{uniqueVoters}</Strong>
          </InfoLine>
        )}
      </VStackSection>
      <VStackSection
        className={
          status ? '' : 'pb-0 tablet:pb-0 border-b-0 tablet:border-b-0 '
        }
      >
        <SectionHeader>{t('votingTerminal.duration')}</SectionHeader>
        <InfoLine>
          <p>{t('votingTerminal.startDate')}</p>
          <Strong>{startDate}</Strong>
        </InfoLine>
        <InfoLine>
          <p>{t('votingTerminal.endDate')}</p>
          <Strong>{endDate}</Strong>
        </InfoLine>
      </VStackSection>
    </>
  );
};

export default InfoTab;

const CurrentParticipationWrapper = styled.div.attrs({
  className: 'space-y-0.5 text-right',
})``;

const VStackSection = styled.div.attrs({
  className:
    'space-y-1.5 p-2 tablet:p-3 -mx-2 tablet:-mx-3 border-b border-ui-100' as string,
})``;

const InfoLine = styled.div.attrs({
  className: 'flex justify-between text-ui-600',
})``;

const Strong = styled.p.attrs({
  className: 'font-bold text-ui-800',
})``;

const SectionHeader = styled.p.attrs({
  className: 'font-bold text-ui-800 ft-text-lg',
})``;
