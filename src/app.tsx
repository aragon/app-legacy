import React, {Suspense, lazy, useEffect} from 'react';
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom';

import {GridLayout} from 'components/layout';
import ProtectedRoute from 'components/protectedRoute';
import {Loading} from 'components/temporary/loading';
import ExploreFooter from 'containers/exploreFooter';
import Footer from 'containers/footer';
import Navbar from 'containers/navbar';
import DaoSelectMenu from 'containers/navbar/daoSelectMenu';
import ExploreNav from 'containers/navbar/exploreNav';
import {NetworkErrorMenu} from 'containers/networkErrorMenu';
import TransactionDetail from 'containers/transactionDetail';
import TransferMenu from 'containers/transferMenu';
import {WalletMenu} from 'containers/walletMenu';
import {ProposalTransactionProvider} from 'context/proposalTransaction';
import {useTransactionDetailContext} from 'context/transactionDetail';
import {FormProvider, useForm} from 'react-hook-form';
import DepositModal from 'containers/transactionModals/depositModal';
import PoapClaimModal from 'containers/poapClaiming/PoapClaimModal';
import {GovTokensWrappingProvider} from 'context/govTokensWrapping';
import {useWallet} from 'hooks/useWallet';
import {identifyUser, trackPage} from 'services/analytics';
import {featureFlags} from 'utils/featureFlags';
import {NotFound} from 'utils/paths';
import {DelegateVotingMenu} from 'containers/delegateVotingMenu';
import '../i18n.config';
import {ProposalSettingsFormData} from 'utils/types';
import {GatingMenu} from 'containers/gatingMenu';
import {DelegationGatingMenu} from 'containers/delegationGatingMenu';
import UpdateBanner from 'containers/navbar/updateBanner';
import {ActionsProvider} from './context/actions';

export const App: React.FC = () => {
  // TODO this needs to be inside a Routes component. Will be moved there with
  // further refactoring of layout (see further below).
  const {pathname} = useLocation();
  const {methods, status, network, address, provider} = useWallet();

  // Initialize feature flags using the initial URL
  useEffect(() => featureFlags.initializeFeatureFlags(), []);

  useEffect(() => {
    if (status === 'connected') {
      identifyUser(address || '', network, provider?.connection.url || '');
    }
  }, [address, network, provider, status]);

  useEffect(() => {
    // This check would prevent the wallet selection modal from opening up if the user hasn't logged in previously.
    // But if the injected wallet like Metamask is locked and the user has logged in before using that wallet, there will be a prompt for password.
    if (localStorage.getItem('WEB3_CONNECT_CACHED_PROVIDER')) {
      methods.selectWallet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    trackPage(pathname);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      {/* TODO: replace with loading indicator */}
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<ExploreWrapper />}>
            <Route path="/" element={<ExplorePage />} />
          </Route>
          <Route element={<DaoWrapper />}>
            <Route path="/create" element={<CreateDaoPage />} />
          </Route>
          <Route path="/daos/:network/:dao">
            <Route element={<DaoWrapper />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="finance" element={<FinancePage />} />
              <Route path="finance/tokens" element={<TokensPage />} />
              <Route path="finance/transfers" element={<TransfersPage />} />
              <Route element={<ProtectedRoute />}>
                <Route
                  path="finance/new-withdrawal"
                  element={<NewWithdrawPage />}
                />
                <Route
                  path="governance/new-proposal/:type"
                  element={<NewProposalPage />}
                />
                <Route element={<NewSettingsWrapper />}>
                  <Route path="settings/edit" element={<EditSettingsPage />} />
                  <Route
                    path="settings/new-proposal"
                    element={<ProposeSettingsPage />}
                  />
                </Route>
                <Route
                  path="community/mint-tokens"
                  element={<MintTokensProposalPage />}
                />
                <Route
                  path="community/manage-members"
                  element={<ManageMembersProposalPage />}
                />
              </Route>
              <Route path="governance" element={<GovernancePage />} />
              <Route
                path="governance/proposals/:id"
                element={<ProposalDetailsWrapper />}
              />
              <Route path="community" element={<CommunityPage />} />
              <Route
                path="members"
                element={<Navigate to={'../community'} replace />}
              />
              <Route path="members/:user" element={<DaoMemberPage />} />
              <Route path="settings" element={<SettingsPage />} />
              {/* Redirects the user to the dashboard page by default if no dao-specific page is specified. */}
              <Route index element={<Navigate to={'dashboard'} replace />} />
            </Route>
          </Route>
          <Route path={NotFound} element={<NotFoundPage />} />
          <Route
            path="*"
            element={
              <Navigate
                to={NotFound}
                state={{incorrectPath: pathname}}
                replace={true}
              />
            }
          />
        </Routes>
      </Suspense>
      <DaoSelectMenu />
      <WalletMenu />
      <PoapClaimModal />
      <NetworkErrorMenu />
    </>
  );
};

const NewSettingsWrapper: React.FC = () => {
  const formMethods = useForm<ProposalSettingsFormData>({
    mode: 'onChange',
    defaultValues: {
      links: [{name: '', url: ''}],
      startSwitch: 'now',
      durationSwitch: 'duration',
      durationDays: '1',
      durationHours: '0',
      durationMinutes: '0',
      proposalTitle: '',
      actions: [],
    },
  });

  const {dao} = useParams();

  return (
    <FormProvider {...formMethods}>
      <ActionsProvider daoId={dao!}>
        <Outlet />
      </ActionsProvider>
    </FormProvider>
  );
};

const ProposalDetailsWrapper: React.FC = () => (
  <ProposalTransactionProvider>
    <ProposalPage />
  </ProposalTransactionProvider>
);

const ExploreWrapper: React.FC = () => (
  <>
    <div className="min-h-screen">
      <ExploreNav />
      <Outlet />
    </div>
    <ExploreFooter />
  </>
);

const DaoWrapper: React.FC = () => {
  // using isOpen to conditionally render TransactionDetail so that
  // api call is not made on mount regardless of whether the user
  // wants to open the modal
  const {isOpen} = useTransactionDetailContext();

  return (
    <GovTokensWrappingProvider>
      <UpdateBanner />
      <Navbar />
      <div className="min-h-screen">
        <GridLayout>
          <Outlet />
          <TransferMenu />
          <DepositModal />
          <GatingMenu />
          <DelegateVotingMenu />
          <DelegationGatingMenu />
          {isOpen && <TransactionDetail />}
        </GridLayout>
      </div>
      <Footer />
    </GovTokensWrappingProvider>
  );
};

// NOTE: these have to be lazy loaded here unfortunately because the
// TipTap Editor behaves weirdly when they are imported from a different
// file. - F.F. [08/15/2023]
// PAGES
const CommunityPage = lazy(() =>
  import('pages/community').then(module => ({default: module.Community}))
);
const CreateDaoPage = lazy(() =>
  import('pages/createDAO').then(module => ({default: module.CreateDAO}))
);
const DashboardPage = lazy(() =>
  import('pages/dashboard').then(module => ({default: module.Dashboard}))
);
const DaoMemberPage = lazy(() =>
  import('pages/daoMember').then(module => ({default: module.DaoMember}))
);
const EditSettingsPage = lazy(() =>
  import('pages/editSettings').then(module => ({default: module.EditSettings}))
);
const ExplorePage = lazy(() =>
  import('pages/explore').then(module => ({default: module.Explore}))
);
const FinancePage = lazy(() =>
  import('pages/finance').then(module => ({default: module.Finance}))
);
const GovernancePage = lazy(() =>
  import('pages/governance').then(module => ({default: module.Governance}))
);
const ManageMembersProposalPage = lazy(() =>
  import('pages/manageMembers').then(module => ({
    default: module.ManageMembers,
  }))
);
const MintTokensProposalPage = lazy(() =>
  import('pages/mintTokens').then(module => ({default: module.MintToken}))
);
const NewProposalPage = lazy(() =>
  import('pages/newProposal').then(module => ({default: module.NewProposal}))
);
const NewWithdrawPage = lazy(() =>
  import('pages/newWithdraw').then(module => ({default: module.NewWithdraw}))
);
const NotFoundPage = lazy(() =>
  import('pages/notFound').then(module => ({default: module.NotFound}))
);
const ProposalPage = lazy(() =>
  import('pages/proposal').then(module => ({default: module.Proposal}))
);
const ProposeSettingsPage = lazy(() =>
  import('pages/proposeSettings').then(module => ({
    default: module.ProposeSettings,
  }))
);
const SettingsPage = lazy(() =>
  import('pages/settings').then(module => ({default: module.Settings}))
);
const TokensPage = lazy(() =>
  import('pages/tokens').then(module => ({default: module.Tokens}))
);
const TransfersPage = lazy(() =>
  import('pages/transfers').then(module => ({default: module.Transfers}))
);
