import {
  ButtonText,
  CardProposal,
  IconChevronRight,
  IconGovernance,
  ListItemHeader,
} from '@aragon/ui-components';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {proposal2CardProps} from 'components/proposalList';
import {StateEmpty} from 'components/stateEmpty';
import {useNetwork} from 'context/network';
import {Governance, NewProposal} from 'utils/paths';
import {ProposalListItem} from 'utils/types';
import {htmlIn} from 'utils/htmlIn';

type Props = {dao: string; proposals: ProposalListItem[]};

const ProposalSnapshot: React.FC<Props> = ({dao, proposals}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork();

  const mappedProposals = useMemo(
    () => proposals.map(p => proposal2CardProps(p, network, navigate)),
    [proposals, network, navigate]
  );

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

      {mappedProposals.map(({id, ...p}) => (
        <CardProposal {...p} key={id} type="list" />
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
