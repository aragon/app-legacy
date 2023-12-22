import {Link, VoterType} from '@aragon/ods-old';
import {Erc20TokenDetails} from '@aragon/sdk-client';
import TipTapLink from '@tiptap/extension-link';
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {Locale, format, formatDistanceToNow} from 'date-fns';
import * as Locales from 'date-fns/locale';
import {TFunction} from 'i18next';
import React, {useEffect, useMemo, useState} from 'react';
import {useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {Markdown} from 'tiptap-markdown';

import {ExecutionWidget} from 'components/executionWidget';
import {useFormStep} from 'components/fullScreenStepper';
import ResourceList from 'components/resourceList';
import {Loading} from 'components/temporary';
import {VotingTerminal} from 'containers/votingTerminal';
import {useClient} from 'hooks/useClient';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {MultisigDaoMember, useDaoMembers} from 'hooks/useDaoMembers';
import {PluginTypes} from 'hooks/usePluginClient';
import {useTokenSupply} from 'hooks/useTokenSupply';
import {useParams} from 'react-router-dom';
import {useProtocolVersion} from 'services/aragon-sdk/queries/use-protocol-version';
import {
  isGaslessVotingSettings,
  isMultisigVotingSettings,
  isTokenVotingSettings,
  useVotingSettings,
} from 'services/aragon-sdk/queries/use-voting-settings';
import {
  KNOWN_FORMATS,
  getCanonicalDate,
  getCanonicalTime,
  getCanonicalUtcOffset,
  getFormattedUtcOffset,
} from 'utils/date';
import {
  getDecodedUpdateActions,
  getErc20VotingParticipation,
  getNonEmptyActions,
} from 'utils/proposals';
import {
  Action,
  ProposalResource,
  ProposalTypes,
  SupportedVotingSettings,
} from 'utils/types';
import {useProviders} from 'context/providers';

type ReviewProposalProps = {
  defineProposalStepNumber: number;
  addActionsStepNumber?: number;
};

const ReviewProposal: React.FC<ReviewProposalProps> = ({
  defineProposalStepNumber,
  addActionsStepNumber,
}) => {
  const {type} = useParams();
  const {client, network} = useClient();
  const {t, i18n} = useTranslation();
  const {setStep} = useFormStep();
  const {api: provider} = useProviders();

  const [displayedActions, setDisplayedActions] = useState<Action[]>([]);

  const {data: daoDetails, isLoading: detailsLoading} = useDaoDetailsQuery();
  const daoAddress = daoDetails?.address as string;
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;
  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;

  const {data: currentProtocolVersion, isLoading: protocolVersionLoading} =
    useProtocolVersion(daoAddress);

  const {data: votingSettings, isLoading: votingSettingsLoading} =
    useVotingSettings({pluginAddress, pluginType});

  const isMultisig = isMultisigVotingSettings(votingSettings);
  const isGasless = isGaslessVotingSettings(votingSettings);

  // Member list only needed for multisig so first page (1000) is sufficient
  const {
    data: {members, daoToken},
  } = useDaoMembers(pluginAddress, pluginType, {page: 0});
  const {data: totalSupply} = useTokenSupply(daoToken?.address as string);

  const {getValues, setValue} = useFormContext();
  const updateFramework = useWatch({name: 'updateFramework'});
  const values = getValues();

  const editor = useEditor({
    editable: false,
    content: values.proposal,
    extensions: [
      StarterKit,
      Markdown,
      TipTapLink.configure({
        openOnClick: false,
      }),
    ],
  });

  const {startSwitch, startDate, startTime, startUtc} = values;

  let calculatedStartDate: number | Date;
  let formattedStartDate = t('labels.now');

  if (startSwitch === 'now') {
    calculatedStartDate = new Date(
      `${getCanonicalDate()}T${getCanonicalTime()}:00${getCanonicalUtcOffset()}`
    );
  } else {
    calculatedStartDate = Date.parse(
      `${startDate}T${startTime}:00${getCanonicalUtcOffset(startUtc)}`
    );
    formattedStartDate = `${format(
      calculatedStartDate,
      KNOWN_FORMATS.proposals
    )} ${getFormattedUtcOffset()}`;
  }

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

    return `~${format(
      endDateTime,
      KNOWN_FORMATS.proposals
    )} ${getFormattedUtcOffset()}`;
  }, [values]);

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
    if (type !== ProposalTypes.OSUpdates) {
      setDisplayedActions(
        getNonEmptyActions(
          getValues('actions'),
          isMultisig ? votingSettings : undefined,
          isGasless ? votingSettings : undefined
        )
      );
    }
  }, [isGasless, getValues, isMultisig, type, votingSettings]);

  useEffect(() => {
    if (type === ProposalTypes.OSUpdates) {
      getDecodedUpdateActions(
        daoAddress,
        getNonEmptyActions(getValues('actions')),
        updateFramework,
        currentProtocolVersion,
        client,
        network,
        provider,
        t
      ).then(actions => {
        if (actions) {
          setDisplayedActions(actions);
        }
      });
    }
  }, [
    client,
    currentProtocolVersion,
    daoAddress,
    getValues,
    network,
    provider,
    t,
    type,
    updateFramework,
  ]);

  useEffect(() => {
    if (values.proposal === '<p></p>') {
      setValue('proposal', '');
    }
  }, [setValue, values.proposal]);

  /*************************************************
   *                    Render                     *
   *************************************************/
  if (
    detailsLoading ||
    votingSettingsLoading ||
    protocolVersionLoading ||
    !terminalProps
  )
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
          {values.proposal && <StyledEditorContent editor={editor} />}

          {votingSettings && (
            <VotingTerminal
              title={
                isMultisigVotingSettings(votingSettings)
                  ? t('votingTerminal.multisig.title')
                  : isGaslessVotingSettings(votingSettings)
                  ? t('votingTerminal.vocdoni.titleCommunityVoting')
                  : t('votingTerminal.title')
              }
              pluginType={pluginType}
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
          )}

          <ExecutionWidget
            actions={displayedActions}
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

const Header = styled.p.attrs({
  className: 'font-semibold text-neutral-800 text-4xl leading-tight',
})``;

const BadgeContainer = styled.div.attrs({
  className: 'md:flex items-baseline mt-6 md:space-x-6',
})``;

const ProposerLink = styled.p.attrs({
  className: 'mt-3 md:mt-0 text-neutral-500',
})``;

const SummaryText = styled.p.attrs({
  className: 'text-xl leading-normal text-neutral-600 mt-6',
})``;

const ProposalContainer = styled.div.attrs({
  className: 'space-y-6 md:w-3/5',
})``;

const AdditionalInfoContainer = styled.div.attrs({
  className: 'space-y-6 md:w-2/5',
})``;

const ContentContainer = styled.div.attrs({
  className: 'mt-6 md:flex md:space-x-6 space-y-6 md:space-y-0',
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
          m => ({wallet: m.address, option: 'none'}) as VoterType
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
