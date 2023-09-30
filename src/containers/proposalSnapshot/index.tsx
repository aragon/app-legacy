import {
  ButtonText,
  CardProposal,
  CardProposalProps,
  IconChevronRight,
  IconGovernance,
  ListItemHeader,
} from '@aragon/ods';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {proposal2CardProps} from 'components/proposalList';
import {StateEmpty} from 'components/stateEmpty';
import {useNetwork} from 'context/network';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {PluginTypes} from 'hooks/usePluginClient';
import {htmlIn} from 'utils/htmlIn';
import {Governance, NewProposal} from 'utils/paths';
import {ProposalListItem} from 'utils/types';
import {useWallet} from 'hooks/useWallet';
import {useUpdateProposal} from 'hooks/useUpdateProposal';
import { featureFlags } from 'utils/featureFlags';

type Props = {
  daoAddressOrEns: string;
  pluginAddress: string;
  pluginType: PluginTypes;
  proposals: ProposalListItem[];
};

const ProposalItem: React.FC<{proposalId: string} & CardProposalProps> =
  props => {
    const {isAragonVerifiedUpdateProposal} = useUpdateProposal(
      props.proposalId
    );
    const {t} = useTranslation();

    return (
      <CardProposal
        {...props}
        bannerContent={
          isAragonVerifiedUpdateProposal &&
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
  proposals,
}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {address} = useWallet();
  const {network} = useNetwork(); // TODO ensure this is the dao network

  const {data: members, isLoading: areMembersLoading} = useDaoMembers(
    pluginAddress,
    pluginType
  );

  const mappedProposals = useMemo(
    () =>
      proposals.map(p => {
        return proposal2CardProps(
          p,
          members.members.length,
          network,
          navigate,
          t,
          daoAddressOrEns,
          address
        );
      }),
    [
      proposals,
      members.members.length,
      network,
      navigate,
      t,
      daoAddressOrEns,
      address,
    ]
  );

  if (proposals.length === 0 || areMembersLoading) {
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
              generatePath(NewProposal, {network, dao: daoAddressOrEns})
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
        value={proposals.length.toString()}
        label={t('dashboard.proposalsTitle')}
        buttonText={t('newProposal.title')}
        orientation="horizontal"
        onClick={() =>
          navigate(generatePath(NewProposal, {network, dao: daoAddressOrEns}))
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
  className: 'space-y-1.5 desktop:space-y-2 w-full',
})``;
