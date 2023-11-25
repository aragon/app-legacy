import {
  ButtonText,
  CardProposal,
  CardProposalProps,
  IconChevronRight,
  IconGovernance,
  ListItemHeader,
} from '@aragon/ods-old';
import {DaoAction} from '@aragon/sdk-client-common';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {proposal2CardProps} from 'components/proposalList';
import {StateEmpty} from 'components/stateEmpty';
import {Loading} from 'components/temporary';
import {useNetwork} from 'context/network';
import {useClient} from 'hooks/useClient';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {PluginTypes} from 'hooks/usePluginClient';
import {useWallet} from 'hooks/useWallet';
import {
  PROPOSALS_PER_PAGE,
  useProposals,
} from 'services/aragon-sdk/queries/use-proposals';
import {featureFlags} from 'utils/featureFlags';
import {htmlIn} from 'utils/htmlIn';
import {Governance, NewProposal} from 'utils/paths';
import {isVerifiedAragonUpdateProposal} from 'utils/proposals';
import {ProposalTypes} from 'utils/types';

type Props = {
  daoAddressOrEns: string;
  pluginAddress: string;
  pluginType: PluginTypes;
};

type ProposalItemProps = CardProposalProps & {
  proposalId: string;
  actions: DaoAction[];
};

const ProposalItem: React.FC<ProposalItemProps> = ({actions, ...props}) => {
  const {t} = useTranslation();
  const {client} = useClient();

  let verifiedUpdateProposal = false;

  if (client != null) {
    verifiedUpdateProposal = isVerifiedAragonUpdateProposal(actions, client);
  }

  return (
    <CardProposal
      {...props}
      bannerContent={
        verifiedUpdateProposal &&
        featureFlags.getValue('VITE_FEATURE_FLAG_OSX_UPDATES') === 'true'
          ? t('update.proposal.bannerTitle')
          : ''
      }
    />
  );
};

const ProposalSnapshot: React.FC<Props> = ({
  daoAddressOrEns,
  pluginAddress,
  pluginType,
}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {address} = useWallet();
  const {network} = useNetwork();

  const {
    data,
    isFetched: proposalsFetched,
    isLoading: proposalsAreLoading,
  } = useProposals({
    daoAddressOrEns,
    pluginType,
    pluginAddress,
  });

  const {data: members} = useDaoMembers(pluginAddress, pluginType, {
    countOnly: true,
  });

  const mappedProposals = data?.pages
    .flat()
    .slice(0, PROPOSALS_PER_PAGE)
    .map(p => {
      return proposal2CardProps(
        p,
        members.memberCount,
        network,
        navigate,
        t,
        daoAddressOrEns,
        address
      );
    });

  if (proposalsAreLoading) {
    return <Loading />;
  }

  if ((proposalsFetched && mappedProposals?.length === 0) || !mappedProposals) {
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
          onClick: () =>
            navigate(
              generatePath(NewProposal, {
                type: ProposalTypes.Default,
                network,
                dao: daoAddressOrEns,
              })
            ),
        }}
        renderHtml
      />
    );
  }

  return (
    <Container>
      <ListItemHeader
        icon={<IconGovernance />}
        value={mappedProposals.length.toString()}
        label={t('dashboard.proposalsTitle')}
        buttonText={t('newProposal.title')}
        orientation="horizontal"
        onClick={() =>
          navigate(
            generatePath(NewProposal, {
              type: ProposalTypes.Default,
              network,
              dao: daoAddressOrEns,
            })
          )
        }
      />

      {mappedProposals.map(({id, ...p}) => (
        <ProposalItem {...p} proposalId={id} key={id} type="list" />
      ))}

      <ButtonText
        mode="secondary"
        size="large"
        iconRight={<IconChevronRight />}
        label={t('labels.seeAll')}
        onClick={() =>
          navigate(generatePath(Governance, {network, dao: daoAddressOrEns}))
        }
      />
    </Container>
  );
};

export default ProposalSnapshot;

const Container = styled.div.attrs({
  className: 'space-y-3 xl:space-y-4 w-full',
})``;
