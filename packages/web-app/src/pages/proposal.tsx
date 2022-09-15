import {
  Badge,
  Breadcrumb,
  ButtonText,
  IconChevronDown,
  IconChevronUp,
  IconGovernance,
  Link,
} from '@aragon/ui-components';
import {shortenAddress} from '@aragon/ui-components/src/utils/addresses';
import {withTransaction} from '@elastic/apm-rum-react';
import TipTapLink from '@tiptap/extension-link';
import {useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, {useEffect, useState, useMemo, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';

import ResourceList from 'components/resourceList';
import {Loading} from 'components/temporary';
import {StyledEditorContent} from 'containers/reviewProposal';
import {useNetwork} from 'context/network';
import {useCache} from 'hooks/useCache';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {useDaoProposal} from 'hooks/useDaoProposal';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';
import {PluginTypes} from 'hooks/usePluginClient';
import useScreen from 'hooks/useScreen';
import {useWallet} from 'hooks/useWallet';
import {CHAIN_METADATA} from 'utils/constants';
import {ExecutionWidget} from 'components/executionWidget';
import {useClient} from 'hooks/useClient';
import {useApolloClient} from '@apollo/client';
import {ActionWithdraw} from 'utils/types';
import {decodeWithdrawToAction} from 'utils/library';

const PROPOSAL_TAGS = ['Finance', 'Withdraw'];

const Proposal: React.FC = () => {
  const {t} = useTranslation();
  const {id} = useParams();
  const navigate = useNavigate();
  const {isDesktop} = useScreen();
  const {breadcrumbs, tag} = useMappedBreadcrumbs();
  const apolloClient = useApolloClient();
  const [decodedActions, setDecodedActions] =
    useState<(ActionWithdraw | undefined)[]>();
  const {client} = useClient();

  const {set, get} = useCache();

  const {network} = useNetwork();
  const {address} = useWallet();

  const {data: daoId, loading: paramIsLoading} = useDaoParam();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetails(
    daoId || ''
  );
  const {data: proposal, isLoading: proposalIsLoading} = useDaoProposal(
    id || '',
    daoDetails?.plugins[0].instanceAddress || '',
    daoDetails?.plugins[0].id as PluginTypes
  );

  const [expandedProposal, setExpandedProposal] = useState(false);

  const editor = useEditor({
    editable: false,
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
    if (proposal && editor) {
      editor.commands.setContent(proposal.metadata.description, false);
    }
  }, [editor, proposal]);

  useEffect(() => {
    if (proposal) {
      const actionPromises = proposal.actions.map(action => {
        const functionParams = client?.decoding.findInterface(action.data);
        switch (functionParams?.functionName) {
          case 'withdraw':
            return decodeWithdrawToAction(
              action.data,
              client,
              apolloClient,
              network
            );
          default:
            return Promise.resolve({} as ActionWithdraw);
        }
      });
      Promise.all(actionPromises).then(value => {
        setDecodedActions(value);
      });
    }
  }, [apolloClient, client, network, proposal]);

  const executionStatus = useMemo(() => {
    switch (proposal?.status) {
      case 'Succeeded':
        return 'executable';
      case 'Executed':
        // TODO: add cases for failed execution
        // executionStatus = 'executable-failed';
        return 'executed';
      case 'Defeated':
        return 'defeated';
      case 'Active':
      case 'Pending':
      default:
        return 'default';
    }
  }, [proposal?.status]);

  // caches the status for breadcrumb
  useEffect(() => {
    if (proposal && proposal.status !== get('proposalStatus'))
      set('proposalStatus', proposal.status);
  }, [get, proposal, set]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (paramIsLoading || proposalIsLoading || detailsAreLoading) {
    return <Loading />;
  }

  return (
    <Container>
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
        <ProposalTitle>{proposal?.metadata.title}</ProposalTitle>
        <ContentWrapper>
          <BadgeContainer>
            {PROPOSAL_TAGS.map((tag: string) => (
              <Badge label={tag} key={tag} />
            ))}
          </BadgeContainer>
          <ProposerLink>
            {t('governance.proposals.publishedBy')}{' '}
            <Link
              external
              label={
                proposal?.creatorAddress === address?.toLowerCase()
                  ? t('labels.you')
                  : shortenAddress(proposal?.creatorAddress || '')
              }
              href={`${CHAIN_METADATA[network].explorer}/address/${proposal?.creatorAddress}`}
            />
          </ProposerLink>
        </ContentWrapper>
        <SummaryText>{proposal?.metadata.summary}</SummaryText>
        {!expandedProposal && (
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
          {expandedProposal && (
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
          {/* TODO: Fill out voting terminal props*/}
          {/* <VotingTerminal /> */}

          <ExecutionWidget actions={decodedActions} status={executionStatus} />
        </ProposalContainer>
        <AdditionalInfoContainer>
          <ResourceList links={proposal?.metadata.resources} />
          {/* TODO: Fill out proposal steps*/}
          {/* <WidgetStatus steps={proposalSteps} /> */}
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
