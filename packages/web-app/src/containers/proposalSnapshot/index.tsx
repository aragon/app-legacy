import {
  ListItemHeader,
  IconGovernance,
  CardProposal,
  ButtonText,
  IconChevronRight,
} from '@aragon/ui-components';
import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {useNavigate, generatePath} from 'react-router-dom';

import {useNetwork} from 'context/network';
import {MockProposal} from 'hooks/useDaoProposals';
import {NewProposal, Governance} from 'utils/paths';
import {StateEmpty} from '@aragon/ui-components/src';

type Props = {dao: string; proposals: MockProposal[]};

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
        title={'Create Very First Proposal'}
        description={t('governance.emptyState.completeDescription')}
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

      {proposals.map((p, index) => (
        <CardProposal key={index} type="list" onClick={() => null} {...p} />
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
