import {
  ButtonText,
  CardProposal,
  IconChevronRight,
  IconGovernance,
  ListItemHeader,
} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {mapToCardViewProposal} from 'components/proposalList';
import {StateEmpty} from 'components/stateEmpty';
import {useNetwork} from 'context/network';
import {Governance, NewProposal, Proposal} from 'utils/paths';
import {ProposalListItem} from 'utils/types';
import {htmlIn} from 'utils/htmlIn';

type Props = {dao: string; proposals: ProposalListItem[]};

const ProposalSnapshot: React.FC<Props> = ({dao, proposals}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork();

  if (proposals.length === 0) {
    return (
      <StateEmpty
        type="Human"
        mode="card"
        body={'voting'}
        expression={'smile'}
        hair={'middle'}
        accessory={'earrings_rhombus'}
        sunglass={'big_rounded'}
        title={t('governance.emptyState.title')}
        description={htmlIn(t)('governance.emptyState.description')}
        primaryButton={{
          label: t('TransactionModal.createProposal'),
          onClick: () => navigate(generatePath(NewProposal, {network, dao})),
        }}
        renderHtml
      />
    );
  }

  return (
    <Container>
      <ListItemHeader
        icon={<IconGovernance />}
        value={proposals.length.toString()}
        label={t('dashboard.proposalsTitle')}
        buttonText={t('newProposal.title')}
        orientation="horizontal"
        onClick={() => navigate(generatePath(NewProposal, {network, dao}))}
      />

      {mapToCardViewProposal(proposals, network).map(p => (
        <CardProposal
          key={p.id}
          type="list"
          onClick={() =>
            navigate(generatePath(Proposal, {network, dao, id: p.id}))
          }
          {...p}
        />
      ))}

      <ButtonText
        mode="secondary"
        size="large"
        iconRight={<IconChevronRight />}
        label={t('labels.seeAll')}
        onClick={() => navigate(generatePath(Governance, {network, dao}))}
      />
    </Container>
  );
};

export default ProposalSnapshot;

const Container = styled.div.attrs({
  className: 'space-y-1.5 desktop:space-y-2 w-full',
})``;
