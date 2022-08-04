import {
  Badge,
  ButtonText,
  IconChevronDown,
  IconChevronUp,
  CardExecution,
  Link,
} from '@aragon/ui-components';
import styled from 'styled-components';
import {format} from 'date-fns';
import StarterKit from '@tiptap/starter-kit';
import TipTapLink from '@tiptap/extension-link';
import {useQuery} from '@apollo/client';
import {useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {useFormContext} from 'react-hook-form';
import {EditorContent, useEditor} from '@tiptap/react';
import React, {useEffect, useMemo, useState} from 'react';

import {Loading} from 'components/temporary';
import {BigNumber} from '@ethersproject/bignumber';
import {useNetwork} from 'context/network';
import ResourceList from 'components/resourceList';
import {formatUnits} from 'utils/library';
import {getTokenInfo} from 'utils/tokens';
import {VotingTerminal} from 'containers/votingTerminal';
import {useFormStep} from 'components/fullScreenStepper';
import {CHAIN_METADATA} from 'utils/constants';
import {useSpecificProvider} from 'context/providers';
import {DAO_PACKAGE_BY_DAO_ID} from 'queries/packages';
import {
  getFormattedUtcOffset,
  getCanonicalUtcOffset,
  KNOWN_FORMATS,
} from 'utils/date';
import {useDaoMetadata} from 'hooks/useDaoMetadata';

type ReviewProposalProps = {
  defineProposalStepNumber: number;
};

const ReviewProposal: React.FC<ReviewProposalProps> = ({
  defineProposalStepNumber,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const provider = useSpecificProvider(CHAIN_METADATA[network].id);

  const {dao} = useParams();
  const {data: metadata, loading: metadataLoading} = useDaoMetadata(dao || '');
  const {data, loading} = useQuery(DAO_PACKAGE_BY_DAO_ID, {
    variables: {dao},
  });

  const {getValues, setValue} = useFormContext();
  const {setStep} = useFormStep();
  const {t} = useTranslation();
  const values = getValues();

  const [expandedProposal, setExpandedProposal] = useState(false);
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

  const startDate = useMemo(
    () =>
      Date.parse(
        `${values.startDate}T${values.startTime}:00${getCanonicalUtcOffset(
          values.startUtc
        )}`
      ),
    [values.startDate, values.startTime, values.startUtc]
  );

  const formattedStartDate = useMemo(
    () =>
      `${format(
        startDate,
        KNOWN_FORMATS.proposals
      )} ${getFormattedUtcOffset()}`,
    [startDate]
  );

  const formattedEndDate = useMemo(() => {
    let endDate: number;

    if (values.durationSwitch === 'duration') {
      const tempStart = new Date(startDate);
      endDate = tempStart.setDate(
        tempStart.getDate() + parseInt(values.duration)
      );
    } else {
      endDate = Date.parse(
        `${values.endDate}T${values.endTime}:00${getCanonicalUtcOffset(
          values.endUtc
        )}`
      );
    }

    return `${format(
      endDate,
      KNOWN_FORMATS.proposals
    )} ${getFormattedUtcOffset()}`;
  }, [
    startDate,
    values.duration,
    values.durationSwitch,
    values.endDate,
    values.endTime,
    values.endUtc,
  ]);

  /*************************************************
   *                    Hooks                      *
   *************************************************/
  useEffect(() => {
    async function mapToView() {
      let formattedMinApproval: string;
      let formattedParticipation: string;
      const {token, supportRequiredPct, users} = data.daoPackages[0].pkg;

      if (token) {
        // get total supply
        const {totalSupply} = await getTokenInfo(
          token.id,
          provider,
          CHAIN_METADATA[network].nativeCurrency
        );

        // calculate & format approval
        formattedMinApproval = `${formatUnits(
          BigNumber.from(supportRequiredPct)
            .mul(BigNumber.from(totalSupply))
            .div(100),
          token.decimals
        )} ${token.symbol} (${BigInt(supportRequiredPct).toString()}%)`;

        // calculate & format participation
        formattedParticipation = `0 of ${formatUnits(
          totalSupply,
          token.decimals
        )} ${token.symbol} (0%)`;
      } else {
        formattedMinApproval = `${BigNumber.from(supportRequiredPct)
          .mul(users.length)
          .div(100)} members (${BigInt(supportRequiredPct).toString()}%)`;
        formattedParticipation = `0 of ${users.length} members (0%)`;
      }
      setApproval(formattedMinApproval);
      setParticipation(formattedParticipation);
    }

    if (data) {
      mapToView();
    }
  }, [data, network, provider]);

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

  if (loading || metadataLoading) return <Loading />;

  return (
    <>
      <Header>{values.proposalTitle}</Header>
      <BadgeContainer>
        <div className="flex space-x-1.5">
          <Badge label="Finance" />
          <Badge label="Withdraw" />
        </div>
        <ProposerLink>
          {t('governance.proposals.publishedBy')}{' '}
          <Link external label={t('labels.you')} />
        </ProposerLink>
      </BadgeContainer>

      <SummaryText>{values.proposalSummary}</SummaryText>

      {values.proposal && !expandedProposal && (
        <ButtonText
          className="mt-3 w-full tablet:w-max"
          label={t('governance.proposals.buttons.readFullProposal')}
          mode="secondary"
          iconRight={<IconChevronDown />}
          onClick={() => setExpandedProposal(true)}
        />
      )}

      <ContentContainer expandedProposal={expandedProposal}>
        <ProposalContainer>
          {values.proposal && expandedProposal && (
            <>
              <StyledEditorContent editor={editor} />

              <ButtonText
                className="mt-3 w-full tablet:w-max"
                label={t('governance.proposals.buttons.closeFullProposal')}
                mode="secondary"
                iconRight={<IconChevronUp />}
                onClick={() => setExpandedProposal(false)}
              />
            </>
          )}

          <VotingTerminal
            breakdownTabDisabled
            votersTabDisabled
            voteNowDisabled
            statusLabel={t('votingTerminal.notStartedYet')}
            approval={approval}
            participation={participation}
            startDate={formattedStartDate}
            endDate={formattedEndDate}
          />

          {/* TODO: generalize types so that proper execution card can be rendered */}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {values.actions?.map((action: any, index: number) => (
            <CardExecution
              key={index}
              title={t('governance.executionCard.title')}
              description={t('governance.executionCard.description')}
              to={action.to}
              from={metadata.name}
              toLabel={t('labels.to')}
              fromLabel={t('labels.from')}
              tokenName={action.tokenName}
              tokenImageUrl={action.tokenImgUrl}
              tokenSymbol={action.tokenSymbol}
              tokenCount={action.amount}
              treasuryShare={
                action.tokenPrice
                  ? new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(action.tokenPrice * action.amount)
                  : t('finance.unknownUSDValue')
              }
            />
          ))}
        </ProposalContainer>

        <AdditionalInfoContainer>
          <ResourceList
            links={values.links}
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

type ContentContainerProps = {
  expandedProposal: boolean;
};

const ContentContainer = styled.div.attrs(
  ({expandedProposal}: ContentContainerProps) => ({
    className: `${
      expandedProposal ? 'tablet:mt-5' : 'tablet:mt-8'
    } mt-3 tablet:flex tablet:space-x-3 space-y-3 tablet:space-y-0`,
  })
)<ContentContainerProps>``;

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
