import React from 'react';
import {CardProposal, CardProposalProps, ListItemHeader} from '@aragon/ods-old';
import {Button, Icon, IconType} from '@aragon/ods';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {proposal2CardProps} from 'components/proposalList';
import {StateEmpty} from 'components/stateEmpty';
import {Loading} from 'components/temporary';
import {useNetwork} from 'context/network';
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
import {ProposalTypes} from 'utils/types';
import {useIsUpdateProposal} from 'hooks/useIsUpdateProposal';
import {useTotalProposalCount} from 'services/aragon-subgraph/queries/use-total-proposal-count';

type Props = {
  daoAddressOrEns: string;
  pluginAddress: string;
  pluginType: PluginTypes;
};

type ProposalItemProps = CardProposalProps & {
  proposalId: string;
};

const ProposalItem: React.FC<ProposalItemProps> = ({proposalId, ...props}) => {
  const {t} = useTranslation();
  const [{data: isPluginUpdate}, {data: isOSUpdate}] =
    useIsUpdateProposal(proposalId);

  return (
    <CardProposal
      {...props}
      bannerContent={
        (isPluginUpdate || isOSUpdate) &&
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

  const {data, isLoading: proposalsAreLoading} = useProposals({
    daoAddressOrEns,
    pluginType,
    pluginAddress,
  });

  const {
    data: proposalCount,
    error: proposalCountError,
    isLoading: proposalCountIsLoading,
    isFetched: proposalCountIsFetched,
  } = useTotalProposalCount({
    pluginAddress,
    pluginType,
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

  if (proposalsAreLoading || proposalCountIsLoading) {
    return <Loading />;
  }

  if (proposalCountIsFetched && (proposalCount === 0 || proposalCountError)) {
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

  // gasless plugin does not have a proposal count yet; use the length
  // of the page
  const displayedCount = proposalCount ?? data?.pages.flat().length;

  return (
    <Container>
      <ListItemHeader
        icon={<Icon icon={IconType.APP_PROPOSALS} />}
        value={displayedCount?.toString() ?? '0'}
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

      {mappedProposals?.map(({id, ...p}) => (
        <ProposalItem {...p} proposalId={id} key={id} type="list" />
      ))}

      <Button
        variant="tertiary"
        size="lg"
        iconRight={IconType.CHEVRON_RIGHT}
        onClick={() =>
          navigate(generatePath(Governance, {network, dao: daoAddressOrEns}))
        }
      >
        {t('labels.seeAll')}
      </Button>
    </Container>
  );
};

export default ProposalSnapshot;

const Container = styled.div.attrs({
  className: 'space-y-3 xl:space-y-4 w-full',
})``;
