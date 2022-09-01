import {HeaderDao} from '@aragon/ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
import React from 'react';
import styled from 'styled-components';

import {Loading} from 'components/temporary';
import {MembershipSnapshot} from 'containers/membershipSnapshot';
import ProposalSnapshot from 'containers/proposalSnapshot';
import TreasurySnapshot from 'containers/treasurySnapshot';
import {useNetwork} from 'context/network';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {useDaoVault} from 'hooks/useDaoVault';
import {PluginTypes} from 'hooks/usePluginClient';
import {Proposal, useProposals} from 'hooks/useProposals';
import useScreen from 'hooks/useScreen';
import {useTranslation} from 'react-i18next';
import {formatDate} from 'utils/date';
import {Transfer} from 'utils/types';

const Dashboard: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {isDesktop} = useScreen();

  const {data: daoId, loading: daoParamLoading} = useDaoParam();

  const {transfers, totalAssetValue} = useDaoVault(daoId!);
  const {data: dao, isLoading: detailsAreLoading} = useDaoDetails(daoId!);

  const {data: topTen, isLoading: proposalsAreLoading} = useProposals(
    dao?.plugins[0].instanceAddress || '',
    dao?.plugins[0].id as PluginTypes
  );

  if (proposalsAreLoading || detailsAreLoading || daoParamLoading) {
    return <Loading />;
  }

  if (!dao) return null;

  const isAddressList =
    (dao.plugins[0].id as PluginTypes) === 'addresslistvoting.dao.eth';

  return (
    <>
      <HeaderWrapper>
        <HeaderDao
          daoName={dao.metadata.name}
          daoAvatar={dao.metadata.avatar}
          daoUrl={`app.aragon.org/#/daos/${network}/${daoId}`}
          description={dao.metadata.description}
          created_at={formatDate(
            dao.creationDate.getTime() / 1000,
            'MMMM yyyy'
          ).toString()}
          daoChain={network}
          daoType={
            isAddressList
              ? t('explore.explorer.walletBased')
              : t('explore.explorer.tokenBased')
          }
          links={
            dao?.metadata.links.map(link => ({
              label: link.name,
              href: link.url,
            })) || []
          }
        />
      </HeaderWrapper>

      {isDesktop ? (
        <DashboardContent
          dao={daoId}
          proposals={topTen}
          transfers={transfers}
          totalAssetValue={totalAssetValue}
          walletBased={isAddressList}
        />
      ) : (
        <MobileDashboardContent
          dao={daoId}
          proposals={topTen}
          transfers={transfers}
          totalAssetValue={totalAssetValue}
          walletBased={isAddressList}
        />
      )}
    </>
  );
};

const HeaderWrapper = styled.div.attrs({
  className:
    'w-screen -mx-2 tablet:col-span-full tablet:w-full tablet:mx-0 desktop:col-start-2 desktop:col-span-10',
})``;

/* DESKTOP DASHBOARD ======================================================== */

type DashboardContentProps = {
  dao: string;
  proposals: Proposal[];
  transfers: Transfer[];
  totalAssetValue: number;
  walletBased: boolean;
};

const DashboardContent: React.FC<DashboardContentProps> = ({
  proposals,
  transfers,
  dao,
  totalAssetValue,
  walletBased,
}) => {
  const proposalCount = proposals.length;
  const transactionCount = transfers.length;

  if (!proposalCount) {
    return (
      <>
        {!transactionCount ? (
          <EqualDivide>
            <ProposalSnapshot dao={dao} proposals={proposals} />
            <TreasurySnapshot
              dao={dao}
              transfers={transfers}
              totalAssetValue={totalAssetValue}
            />
          </EqualDivide>
        ) : (
          <>
            <LeftWideContent>
              <ProposalSnapshot dao={dao} proposals={proposals} />
            </LeftWideContent>
            <RightNarrowContent>
              <TreasurySnapshot
                dao={dao}
                transfers={transfers}
                totalAssetValue={totalAssetValue}
              />
            </RightNarrowContent>
          </>
        )}
        <MembersWrapper>
          <MembershipSnapshot dao={dao} walletBased={walletBased} horizontal />
        </MembersWrapper>
      </>
    );
  }

  return (
    <>
      <LeftWideContent>
        <ProposalSnapshot dao={dao} proposals={proposals} />
      </LeftWideContent>
      <RightNarrowContent>
        <TreasurySnapshot
          dao={dao}
          transfers={transfers}
          totalAssetValue={totalAssetValue}
        />
        <MembershipSnapshot dao={dao} walletBased={walletBased} />
      </RightNarrowContent>
    </>
  );
};

// NOTE: These Containers are built SPECIFICALLY FOR >= DESKTOP SCREENS. Since
// the mobile layout is much simpler, it has it's own component.

const LeftWideContent = styled.div.attrs({
  className: 'desktop:space-y-5 desktop:col-start-2 desktop:col-span-6',
})``;

const RightNarrowContent = styled.div.attrs({
  className: 'desktop:col-start-8 desktop:col-span-4 desktop:space-y-3',
})``;

const EqualDivide = styled.div.attrs({
  className:
    'desktop:col-start-2 desktop:col-span-10 desktop:flex desktop:space-x-3',
})``;

const MembersWrapper = styled.div.attrs({
  className: 'desktop:col-start-2 desktop:col-span-10',
})``;

/* MOBILE DASHBOARD CONTENT ================================================= */

const MobileDashboardContent: React.FC<DashboardContentProps> = ({
  dao,
  proposals,
  transfers,
  totalAssetValue,
  walletBased,
}) => {
  return (
    <MobileLayout>
      <ProposalSnapshot dao={dao} proposals={proposals} />
      <TreasurySnapshot
        dao={dao}
        transfers={transfers}
        totalAssetValue={totalAssetValue}
      />
      <MembershipSnapshot dao={dao} walletBased={walletBased} />
    </MobileLayout>
  );
};

const MobileLayout = styled.div.attrs({
  className: 'col-span-full space-y-5',
})``;

export default withTransaction('Dashboard', 'component')(Dashboard);
