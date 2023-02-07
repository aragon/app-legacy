import {InstalledPluginListItem, VotingSettings} from '@aragon/sdk-client';
import {Link, Tag} from '@aragon/ui-components';
import TipTapLink from '@tiptap/extension-link';
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {format} from 'date-fns';
import React, {useEffect, useMemo, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import styled from 'styled-components';

import {ExecutionWidget} from 'components/executionWidget';
import {useFormStep} from 'components/fullScreenStepper';
import ResourceList from 'components/resourceList';
import {TerminalTabs, VotingTerminal} from 'containers/votingTerminal';
import {useNetwork} from 'context/network';
import {useSpecificProvider} from 'context/providers';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {PluginTypes} from 'hooks/usePluginClient';
import {usePluginSettings} from 'hooks/usePluginSettings';
import {CHAIN_METADATA} from 'utils/constants';
import {
  getCanonicalDate,
  getCanonicalTime,
  getCanonicalUtcOffset,
  getFormattedUtcOffset,
  KNOWN_FORMATS,
  minutesToMills,
} from 'utils/date';
import {
  getErc20VotingParticipation,
  getNonEmptyActions,
  getWhitelistVoterParticipation,
} from 'utils/proposals';
import {getTokenInfo} from 'utils/tokens';
import {ProposalResource} from 'utils/types';

type ReviewProposalProps = {
  defineProposalStepNumber: number;
  addActionsStepNumber?: number;
};

const ReviewProposal: React.FC<ReviewProposalProps> = ({
  defineProposalStepNumber,
  addActionsStepNumber,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {setStep} = useFormStep();
  const provider = useSpecificProvider(CHAIN_METADATA[network].id);

  const {dao} = useParams();
  const {data: daoDetails} = useDaoDetails(dao!);
  const {id: pluginType, instanceAddress: pluginAddress} =
    daoDetails?.plugins[0] || ({} as InstalledPluginListItem);

  const {
    data: {members, daoToken},
  } = useDaoMembers(pluginAddress, pluginType as PluginTypes);

  const {data} = usePluginSettings(pluginAddress, pluginType as PluginTypes);

  // TODO: fix when implementing multisig
  const daoSettings = data as VotingSettings;

  const {getValues, setValue} = useFormContext();
  const [minParticipation, setMinParticipation] = useState('');
  const [currentParticipation, setCurrentParticipation] = useState('');
  const [missingParticipation, setMissingParticipation] = useState(0);
  const [isWalletBased, setIsWalletBased] = useState(true);
  const [terminalTab, setTerminalTab] = useState<TerminalTabs>('info');
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

  /*************************************************
   *                    Hooks                      *
   *************************************************/
  useEffect(() => {
    async function mapToView() {
      if (pluginType === 'multisig.plugin.dao.eth') {
        setIsWalletBased(true);

        // get voter participation
        const {summary} = getWhitelistVoterParticipation([], members.length);
        setMinParticipation(summary);
      } else {
        // token based
        setIsWalletBased(false);

        if (daoToken && daoSettings) {
          // get voter participation
          const {totalSupply} = await getTokenInfo(
            daoToken.address,
            provider,
            CHAIN_METADATA[network].nativeCurrency
          );

          // calculate participation
          const {
            currentPart,
            currentPercentage,
            minPart,
            missingPart,
            totalWeight,
          } = getErc20VotingParticipation(
            daoSettings.minParticipation,
            BigInt(0),
            totalSupply,
            daoToken.decimals
          );

          setCurrentParticipation(
            t('votingTerminal.participationErc20', {
              participation: currentPart,
              totalWeight,
              tokenSymbol: daoToken.symbol,
              percentage: currentPercentage,
            })
          );

          setMinParticipation(
            t('votingTerminal.participationErc20', {
              participation: minPart,
              totalWeight,
              tokenSymbol: daoToken.symbol,
              percentage: Math.round(daoSettings.minParticipation * 100),
            })
          );

          setMissingParticipation(missingPart);
        }
      }
    }

    if (members) {
      mapToView();
    }
  }, [daoSettings, daoToken, members, network, pluginType, provider, t]);

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

  return (
    <>
      <Header>{values.proposalTitle}</Header>
      <BadgeContainer>
        <div className="flex space-x-1.5">
          <Tag label="Finance" />
          <Tag label="Withdraw" />
        </div>
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
            selectedTab={terminalTab}
            onTabSelected={setTerminalTab}
            statusLabel={t('votingTerminal.status.draft')}
            supportThreshold={
              Math.round(daoSettings.supportThreshold * 100) || 0
            }
            minParticipation={minParticipation}
            currentParticipation={currentParticipation}
            missingParticipation={missingParticipation}
            startDate={formattedStartDate}
            endDate={formattedEndDate}
            strategy={
              isWalletBased
                ? t('votingTerminal.multisig')
                : t('votingTerminal.tokenVoting')
            }
          />

          <ExecutionWidget
            actions={getNonEmptyActions(values.actions, 0)}
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
