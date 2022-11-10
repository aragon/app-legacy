import {ButtonText, CardProposal, IconChevronDown} from '@aragon/ui-components';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {StateEmpty} from 'components/stateEmpty';
import {TemporarySection} from 'components/temporary';
import {useNetwork} from 'context/network';
import {useDaoProposals} from 'hooks/useDaoProposals';
import {CHAIN_METADATA} from 'utils/constants';

// NOTE: There will be changes when integrating proposals.
const ActiveProposalsExplore: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const [showProposals, setShowProposals] = useState(true);
  const topTen = useDaoProposals(showProposals).topTen.filter(
    value => value.process === 'active'
  );
  const [proposalCount, setProposalCount] = useState(3);

  const handleShowMore = () => {
    setProposalCount(prev => prev + 3);
  };

  const handleShowProposals = () => {
    setShowProposals(prev => !prev);
  };

  return (
    <Container>
      <SectionTitle>{t('explore.activeProposals')}</SectionTitle>
      {showProposals ? (
        <>
          <TemporarySection purpose="It allows to toggle between the non-/empty state of active proposals.">
            <ButtonText
              label={'Hide proposals'}
              onClick={handleShowProposals}
            />
          </TemporarySection>
          <CardsWrapper>
            {/* Use proposal id instead of index when integrating */}
            {topTen.slice(0, proposalCount).map((proposal, index) => (
              <CardProposal
                key={index}
                type="explore"
                explorer={CHAIN_METADATA[network].explorer}
                daoName="Some Mock Dao"
                onClick={() =>
                  alert(
                    'This will eventually take you to the proposal detail view.'
                  )
                }
                {...proposal}
              />
            ))}
          </CardsWrapper>
          {proposalCount <= topTen.length && (
            <ButtonText
              mode="secondary"
              label={t('explore.showMore')}
              iconRight={<IconChevronDown />}
              onClick={handleShowMore}
            />
          )}
        </>
      ) : (
        <>
          <TemporarySection>
            <ButtonText
              label={'Show proposals'}
              onClick={handleShowProposals}
            />
          </TemporarySection>
          {
            <StateEmpty
              type="Human"
              mode="card"
              body="voting"
              expression="surprised"
              sunglass="big_rounded"
              hair="middle"
              accessory="earrings_rhombus"
              title={t('explore.emptyStateProposal.title')}
              description={t('explore.emptyStateProposal.description')}
            />
          }
        </>
      )}
    </Container>
  );
};

export default ActiveProposalsExplore;

const Container = styled.div.attrs({className: 'space-y-3'})``;
const SectionTitle = styled.p.attrs({
  className: 'ft-text-xl font-bold text-ui-800',
})``;

const CardsWrapper = styled.div.attrs({
  className: 'grid grid-cols-1 gap-1.5 desktop:grid-cols-3 desktop:gap-3',
})``;
