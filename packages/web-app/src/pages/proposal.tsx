import {
  Badge,
  Breadcrumb,
  ButtonText,
  CardExecution,
  IconChevronDown,
  IconChevronUp,
  IconGovernance,
  Link,
  WidgetStatus,
} from '@aragon/ui-components';
import {shortenAddress} from '@aragon/ui-components/src/utils/addresses';
import {withTransaction} from '@elastic/apm-rum-react';
import TipTapLink from '@tiptap/extension-link';
import {useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';

import ResourceList from 'components/resourceList';
import {Loading} from 'components/temporary';
import {StyledEditorContent} from 'containers/reviewProposal';
import {VotingTerminal} from 'containers/votingTerminal';
import {useNetwork} from 'context/network';
import {useCache} from 'hooks/useCache';
import {useDaoParam} from 'hooks/useDaoParam';
import {useDaoProposal} from 'hooks/useDaoProposal';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';
import useScreen from 'hooks/useScreen';
import {useWallet} from 'hooks/useWallet';
import {CHAIN_METADATA} from 'utils/constants';
import {NotFound} from 'utils/paths';

const Proposal: React.FC = () => {
  const {t} = useTranslation();
  const {id} = useParams();
  const navigate = useNavigate();
  const {address} = useWallet();
  const {network} = useNetwork();
  const {set, get} = useCache();
  const {isDesktop} = useScreen();
  const {data: daoId} = useDaoParam();
  const {breadcrumbs, tag} = useMappedBreadcrumbs();

  if (!id) navigate(NotFound);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [metadata, setMetadata] = useState<Record<string, any> | undefined>();
  const [expandedProposal, setExpandedProposal] = useState(false);

  // voting
  const [votingInProcess, setVotingInProcess] = useState(false);

  const {
    data: {
      mappedProposal,
      proposalSteps,
      creator,
      proposalTags,
      proposalContent,
    },
    isLoading,
    error,
  } = useDaoProposal(id);

  const editor = useEditor({
    editable: false,
    content: proposalContent,
    extensions: [
      StarterKit,
      TipTapLink.configure({
        openOnClick: false,
      }),
    ],
  });

  /*************************************************
   *                     Hooks                     *
   *************************************************/
  useEffect(() => {
    // uncomment when integrating with sdk
    // if (!proposalLoading && proposalData) {
    //   setMetadata(JSON.parse(proposalData.erc20VotingProposals[0].metadata));
    // editor?.commands.setContent(metadata?.proposal, true);
    // }
    setMetadata({
      title: 'Create new Pets United Sub DAO',
      summary: "We're creating a new DAO to manage pets and their owners.",
      proposal: proposalContent,
    });
  }, [proposalContent]);

  // caches the status for breadcrumb
  useEffect(() => {
    const proposalStatus = get('proposalStatus');

    if (mappedProposal && mappedProposal.status !== proposalStatus)
      set('proposalStatus', mappedProposal.status);
  }, [get, mappedProposal, set]);

  const handleCancelClicked = () => {
    setVotingInProcess(false);
  };

  /*************************************************
   *                    Render                    *
   *************************************************/
  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <p>Error. Check console</p>;
  }

  if (!editor) {
    return null;
  }

  return (
    <Container>
      {/* Proposal Header */}
      <HeaderContainer>
        {!isDesktop && (
          <Breadcrumb
            onClick={(path: string) =>
              navigate(generatePath(path, {network, daoId}))
            }
            crumbs={breadcrumbs}
            icon={<IconGovernance />}
            tag={tag}
          />
        )}
        <ProposalTitle>{metadata?.title}</ProposalTitle>
        <ContentWrapper>
          <BadgeContainer>
            {proposalTags.map((tag: string) => (
              <Badge label={tag} key={tag} />
            ))}
          </BadgeContainer>
          <ProposerLink>
            {t('governance.proposals.publishedBy')}{' '}
            <Link
              external
              label={
                creator === address?.toLowerCase()
                  ? t('labels.you')
                  : shortenAddress(creator)
              }
              href={`${CHAIN_METADATA[network].explorer}/address/${creator}`}
            />
          </ProposerLink>
        </ContentWrapper>
        <SummaryText>{metadata?.summary}</SummaryText>

        {metadata?.proposal && !expandedProposal && (
          <ButtonText
            className="w-full tablet:w-max"
            size="large"
            label={t('governance.proposals.buttons.readFullProposal')}
            mode="secondary"
            iconRight={<IconChevronDown />}
            onClick={() => setExpandedProposal(true)}
          />
        )}
      </HeaderContainer>

      <ContentContainer expandedProposal={expandedProposal}>
        <ProposalContainer>
          {metadata?.proposal && expandedProposal && (
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

          {mappedProposal && (
            <VotingTerminal
              {...mappedProposal}
              votingInProcess={votingInProcess}
              onCancelClicked={handleCancelClicked}
            />
          )}

          <CardExecution
            title="Execution"
            description="These smart actions are executed when the proposal reaches sufficient support. Find out which actions are executed."
            to="0x3430008404144CD5000005A44B8ac3f4DB2a3434"
            from="Patito DAO"
            toLabel="To"
            fromLabel="From"
            tokenName="DAI"
            tokenImageUrl="https://s2.coinmarketcap.com/static/img/coins/64x64/4943.png"
            tokenSymbol="DAI"
            tokenCount="15,000,230.2323"
            treasuryShare="$1000.0"
          />
        </ProposalContainer>

        <AdditionalInfoContainer>
          <ResourceList links={[]} />
          <WidgetStatus steps={proposalSteps} />
        </AdditionalInfoContainer>
      </ContentContainer>
    </Container>
  );
};

export default withTransaction('Proposal', 'component')(Proposal);

const Container = styled.div.attrs({
  className: 'col-span-full desktop:col-start-2 desktop:col-end-12',
})``;

const HeaderContainer = styled.div.attrs({
  className: 'flex flex-col gap-y-2 desktop:p-0 px-2 tablet:px-3 pt-2',
})``;

const ProposalTitle = styled.p.attrs({
  className: 'font-bold text-ui-800 text-3xl',
})``;

const ContentWrapper = styled.div.attrs({
  className: 'flex flex-col tablet:flex-row gap-x-3 gap-y-1.5',
})``;

const BadgeContainer = styled.div.attrs({
  className: 'flex flex-wrap gap-x-1.5',
})``;

const ProposerLink = styled.p.attrs({
  className: 'text-ui-500',
})``;

const SummaryText = styled.p.attrs({
  className: 'text-lg text-ui-600',
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
