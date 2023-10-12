import {Link, VoterType} from '@aragon/ods';
import {Erc20TokenDetails} from '@aragon/sdk-client';
import TipTapLink from '@tiptap/extension-link';
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {Locale, format, formatDistanceToNow} from 'date-fns';
import * as Locales from 'date-fns/locale';
import React, {useEffect, useMemo} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {TFunction} from 'i18next';
import styled from 'styled-components';

import {ExecutionWidget} from 'components/executionWidget';
import {useFormStep} from 'components/fullScreenStepper';
import ResourceList from 'components/resourceList';
import {Loading} from 'components/temporary';
import {VotingTerminal} from 'containers/votingTerminal';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {MultisigDaoMember, useDaoMembers} from 'hooks/useDaoMembers';
import {PluginTypes} from 'hooks/usePluginClient';
import {
  isMultisigVotingSettings,
  isTokenVotingSettings,
  useVotingSettings,
} from 'services/aragon-sdk/queries/use-voting-settings';
import {useTokenSupply} from 'hooks/useTokenSupply';
import {
  KNOWN_FORMATS,
  getCanonicalDate,
  getCanonicalTime,
  getCanonicalUtcOffset,
  getFormattedUtcOffset,
  minutesToMills,
} from 'utils/date';
import {getErc20VotingParticipation, getNonEmptyActions} from 'utils/proposals';
import {ProposalResource, SupportedVotingSettings} from 'utils/types';

type ReviewProposalProps = {
  defineProposalStepNumber: number;
  addActionsStepNumber?: number;
};

const ReviewProposal: React.FC<ReviewProposalProps> = ({
  defineProposalStepNumber,
  addActionsStepNumber,
}) => {
  const {t, i18n} = useTranslation();
  const {setStep} = useFormStep();

  const {data: daoDetails, isLoading: detailsLoading} = useDaoDetailsQuery();
  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;

  const {data: votingSettings, isLoading: votingSettingsLoading} =
    useVotingSettings({pluginAddress, pluginType});
  const isMultisig = isMultisigVotingSettings(votingSettings);

  // Member list only needed for multisig so first page (1000) is sufficient
  const {
    data: {members, daoToken},
  } = useDaoMembers(pluginAddress, pluginType, {page: 0});

  const {data: totalSupply} = useTokenSupply(daoToken?.address as string);

  const {getValues, setValue} = useFormContext();
  const values = getValues();

  const editor = useEditor({
    editable: false,
    content: values.proposal,
    extensions: [
      StarterKit,
      TipTapLink.configure({
        openOnClick: false,
      }),
    ],
  });

  const startDate = useMemo(() => {
    const {startSwitch, startDate, startTime, startUtc} = values;

    if (startSwitch === 'now') {
      const startMinutesDelay = isMultisig ? 0 : 10;
      return new Date(
        `${getCanonicalDate()}T${getCanonicalTime({
          minutes: startMinutesDelay,
        })}:00${getCanonicalUtcOffset()}`
      );
    } else {
      return Date.parse(
        `${startDate}T${startTime}:00${getCanonicalUtcOffset(startUtc)}`
      );
    }
  }, [isMultisig, values]);

  const formattedStartDate = useMemo(() => {
    const {startSwitch} = values;
    if (startSwitch === 'now') {
      return t('labels.now');
    }

    return `${format(
      startDate,
      KNOWN_FORMATS.proposals
    )} ${getFormattedUtcOffset()}`;
  }, [startDate, t, values]);

  /**
   * This is the primary (approximate) end date display which is rendered in Voting Terminal
   */
  const formattedEndDate = useMemo(() => {
    const {
      durationDays,
      durationHours,
      durationMinutes,
      durationSwitch,
      endDate,
      endTime,
      endUtc,
    } = values;

    let endDateTime: Date;
    if (durationSwitch === 'duration') {
      endDateTime = new Date(
        `${getCanonicalDate({
          days: durationDays,
        })}T${getCanonicalTime({
          hours: durationHours,
          minutes: durationMinutes,
        })}:00${getCanonicalUtcOffset()}`
      );
    } else {
      endDateTime = new Date(
        `${endDate}T${endTime}:00${getCanonicalUtcOffset(endUtc)}`
      );
    }

    const locale = (Locales as Record<string, Locale>)[i18n.language];

    const resultDate = formatDistanceToNow(endDateTime, {
      includeSeconds: true,
      locale,
    });

    return `${t('votingTerminal.label.in')} ${resultDate}`;
  }, [i18n.language, t, values]);

  /**
   * This is the secondary, supplementary (precisely clear) end date display which is rendered in Voting Terminal
   * UNDER primary end date.
   */
  const formattedPreciseEndDate = useMemo(() => {
    let endDateTime: Date;
    const {
      durationDays,
      durationHours,
      durationMinutes,
      durationSwitch,
      startSwitch,
      endDate,
      endTime,
      endUtc,
    } = values;

    if (durationSwitch === 'duration') {
      endDateTime = new Date(
        `${getCanonicalDate({
          days: durationDays,
        })}T${getCanonicalTime({
          hours: durationHours,
          minutes: durationMinutes,
        })}:00${getCanonicalUtcOffset()}`
      );
    } else {
      endDateTime = new Date(
        `${endDate}T${endTime}:00${getCanonicalUtcOffset(endUtc)}`
      );
    }

    // adding 10 minutes to offset the 10 minutes added by starting now
    if (startSwitch === 'now') {
      const startMinutesDelay = isMultisig ? 0 : 10;
      endDateTime = new Date(
        endDateTime.getTime() + minutesToMills(startMinutesDelay)
      );
    }

    return `~${format(
      endDateTime,
      KNOWN_FORMATS.proposals
    )} ${getFormattedUtcOffset()}`;
  }, [isMultisig, values]);

  const terminalProps = useMemo(() => {
    if (votingSettings) {
      // note this only needs a valid members list if it's multisig
      return getReviewProposalTerminalProps(
        t,
        votingSettings,
        members,
        daoToken,
        totalSupply?.raw
      );
    }
  }, [votingSettings, daoToken, members, t, totalSupply?.raw]);

  /*************************************************
   *                    Effects                    *
   *************************************************/
  useEffect(() => {
    if (values.proposal === '<p></p>') {
      setValue('proposal', '');
    }
  }, [setValue, values.proposal]);

  /*************************************************
   *                    Render                     *
   *************************************************/
  if (detailsLoading || votingSettingsLoading || !terminalProps)
    return <Loading />;

  if (!editor) {
    return null;
  }

  return (
    <>
      <Header>{values.proposalTitle}</Header>
      <BadgeContainer>
        <ProposerLink>
          {t('governance.proposals.publishedBy')}{' '}
          <Link external label={t('labels.you')} />
        </ProposerLink>
      </BadgeContainer>

      <SummaryText>{values.proposalSummary}</SummaryText>

      <ContentContainer>
        <ProposalContainer>
          {values.proposal && (
            <>
              <StyledEditorContent editor={editor} />
            </>
          )}

          <VotingTerminal
            breakdownTabDisabled
            votersTabDisabled
            voteNowDisabled
            selectedTab="info"
            statusLabel={t('votingTerminal.status.draft')}
            startDate={formattedStartDate}
            endDate={formattedEndDate}
            preciseEndDate={formattedPreciseEndDate}
            daoToken={daoToken}
            {...terminalProps}
          />

          <ExecutionWidget
            actions={getNonEmptyActions(
              values.actions,
              isMultisig ? votingSettings : undefined
            )}
            onAddAction={
              addActionsStepNumber
                ? () => setStep(addActionsStepNumber)
                : undefined
            }
          />
        </ProposalContainer>

        <AdditionalInfoContainer>
          <ResourceList
            links={values.links.filter(
              (l: ProposalResource) => l.name && l.url
            )}
            emptyStateButtonClick={() => setStep(defineProposalStepNumber)}
          />
        </AdditionalInfoContainer>
      </ContentContainer>
    </>
  );
};

export default ReviewProposal;

const Header = styled.p.attrs({className: 'font-bold text-ui-800 text-3xl'})``;

const BadgeContainer = styled.div.attrs({
  className: 'tablet:flex items-baseline mt-3 tablet:space-x-3',
})``;

const ProposerLink = styled.p.attrs({
  className: 'mt-1.5 tablet:mt-0 text-ui-500',
})``;

const SummaryText = styled.p.attrs({
  className: 'text-lg text-ui-600 mt-3',
})``;

const ProposalContainer = styled.div.attrs({
  className: 'space-y-3 tablet:w-3/5',
})``;

const AdditionalInfoContainer = styled.div.attrs({
  className: 'space-y-3 tablet:w-2/5',
})``;

const ContentContainer = styled.div.attrs({
  className: 'mt-3 tablet:flex tablet:space-x-3 space-y-3 tablet:space-y-0',
})``;

export const StyledEditorContent = styled(EditorContent)`
  flex: 1;

  .ProseMirror {
    :focus {
      outline: none;
    }

    ul {
      list-style-type: decimal;
      padding: 0 1rem;
    }

    ol {
      list-style-type: disc;
      padding: 0 1rem;
    }

    a {
      color: #003bf5;
      cursor: pointer;
      font-weight: 700;

      :hover {
        color: #0031ad;
      }
    }
  }
`;

// this is slightly different from
function getReviewProposalTerminalProps(
  t: TFunction,
  daoSettings: SupportedVotingSettings,
  daoMembers: MultisigDaoMember[] | undefined,
  daoToken: Erc20TokenDetails | undefined,
  totalSupply: bigint | undefined
) {
  if (isMultisigVotingSettings(daoSettings)) {
    return {
      minApproval: daoSettings.minApprovals,
      strategy: t('votingTerminal.multisig.strategy'),
      voteOptions: t('votingTerminal.approve'),
      approvals: [],
      voters:
        daoMembers?.map(
          m => ({wallet: m.address, option: 'none'} as VoterType)
        ) || [],
    };
  }

  if (isTokenVotingSettings(daoSettings) && daoToken && totalSupply) {
    // calculate participation
    const {currentPart, currentPercentage, minPart, missingPart, totalWeight} =
      getErc20VotingParticipation(
        daoSettings.minParticipation,
        BigInt(0),
        totalSupply,
        daoToken.decimals
      );

    return {
      currentParticipation: t('votingTerminal.participationErc20', {
        participation: currentPart,
        totalWeight,
        tokenSymbol: daoToken.symbol,
        percentage: currentPercentage,
      }),

      minParticipation: t('votingTerminal.participationErc20', {
        participation: minPart,
        totalWeight,
        tokenSymbol: daoToken.symbol,
        percentage: Math.round(daoSettings.minParticipation * 100),
      }),

      missingParticipation: missingPart,

      strategy: t('votingTerminal.tokenVoting'),
      voteOptions: t('votingTerminal.yes+no'),
      supportThreshold: Math.round(daoSettings.supportThreshold * 100),
    };
  }
}
