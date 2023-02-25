import {Erc20TokenDetails, InstalledPluginListItem} from '@aragon/sdk-client';
import {Link, VoterType} from '@aragon/ui-components';
import TipTapLink from '@tiptap/extension-link';
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {format} from 'date-fns';
import React, {useEffect, useMemo} from 'react';
import {useFormContext} from 'react-hook-form';
import {TFunction, useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import styled from 'styled-components';

import {ExecutionWidget} from 'components/executionWidget';
import {useFormStep} from 'components/fullScreenStepper';
import ResourceList from 'components/resourceList';
import {Loading} from 'components/temporary';
import {VotingTerminal} from 'containers/votingTerminal';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {MultisigMember, useDaoMembers} from 'hooks/useDaoMembers';
import {PluginTypes} from 'hooks/usePluginClient';
import {
  isMultisigVotingSettings,
  isTokenVotingSettings,
  usePluginSettings,
} from 'hooks/usePluginSettings';
import {useTokenSupply} from 'hooks/useTokenSupply';
import {
  getCanonicalDate,
  getCanonicalTime,
  getCanonicalUtcOffset,
  getFormattedUtcOffset,
  KNOWN_FORMATS,
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
  const {t} = useTranslation();
  const {setStep} = useFormStep();

  const {dao} = useParams();
  const {data: daoDetails} = useDaoDetails(dao!);
  const {id: pluginType, instanceAddress: pluginAddress} =
    daoDetails?.plugins[0] || ({} as InstalledPluginListItem);

  const {data: daoSettings} = usePluginSettings(
    pluginAddress,
    pluginType as PluginTypes
  );

  const {
    data: {members, daoToken},
  } = useDaoMembers(pluginAddress, pluginType as PluginTypes);

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
      return new Date(
        `${getCanonicalDate()}T${getCanonicalTime({
          minutes: 10,
        })}:00${getCanonicalUtcOffset()}`
      );
    } else {
      return Date.parse(
        `${startDate}T${startTime}:00${getCanonicalUtcOffset(startUtc)}`
      );
    }
  }, [values]);

  const formattedStartDate = useMemo(
    () =>
      `${format(
        startDate,
        KNOWN_FORMATS.proposals
      )} ${getFormattedUtcOffset()}`,
    [startDate]
  );

  const formattedEndDate = useMemo(() => {
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
      endDateTime = new Date(endDateTime.getTime() + minutesToMills(10));
    }

    return `${format(
      endDateTime,
      KNOWN_FORMATS.proposals
    )} ${getFormattedUtcOffset()}`;
  }, [values]);

  const terminalProps = useMemo(
    () =>
      getReviewProposalTerminalProps(
        t,
        daoSettings,
        members,
        daoToken,
        totalSupply?.raw
      ),
    [daoSettings, daoToken, members, t, totalSupply?.raw]
  );

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
  if (!editor) {
    return null;
  }

  if (!terminalProps) return <Loading />;

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
            token={daoToken}
            {...terminalProps}
          />

          <ExecutionWidget
            actions={getNonEmptyActions(
              values.actions,
              isMultisigVotingSettings(daoSettings)
                ? daoSettings.minApprovals
                : 0
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
  daoMembers: Array<MultisigMember> | undefined,
  daoToken: Erc20TokenDetails | undefined,
  totalSupply: bigint | undefined
) {
  if (isMultisigVotingSettings(daoSettings)) {
    return {
      minApproval: daoSettings.minApprovals,
      strategy: t('votingTerminal.multisig'),
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
