import React, {lazy, Suspense, useEffect} from 'react';

// FIXME: Change route to ApmRoute once package has been updated to be
// compatible with react-router-dom v6
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom';

import Navbar from 'containers/navbar';
import {WalletMenu} from 'containers/walletMenu';
import {identifyUser, trackPage} from 'services/analytics';
import '../i18n.config';

// HACK: All pages MUST be exported with the withTransaction function
// from the '@elastic/apm-rum-react' package in order for analytics to
// work properly on the pages.
import {GridLayout} from 'components/layout';
import {Loading} from 'components/temporary/loading';
import Footer from 'containers/exploreFooter';
import DaoSelectMenu from 'containers/navbar/daoSelectMenu';
import ExploreNav from 'containers/navbar/exploreNav';
import NetworkErrorMenu from 'containers/networkErrorMenu';
import TransactionDetail from 'containers/transactionDetail';
import TransferMenu from 'containers/transferMenu';
import {ProposalTransactionProvider} from 'context/proposalTransaction';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useWallet} from 'hooks/useWallet';
import CreateDAO from 'pages/createDAO';
import {FormProvider, useForm} from 'react-hook-form';
import {NotFound} from 'utils/paths';
import ProtectedRoute from 'components/protectedRoute';

const ExplorePage = lazy(() => import('pages/explore'));
const NotFoundPage = lazy(() => import('pages/notFound'));

const DashboardPage = lazy(() => import('pages/dashboard'));
const FinancePage = lazy(() => import('pages/finance'));
const GovernancePage = lazy(() => import('pages/governance'));
const CommunityPage = lazy(() => import('pages/community'));
const SettingsPage = lazy(() => import('pages/settings'));
const EditSettingsPage = lazy(() => import('pages/editSettings'));
const ProposeSettingsPage = lazy(() => import('pages/proposeSettings'));

const TokensPage = lazy(() => import('pages/tokens'));
const TransfersPage = lazy(() => import('pages/transfers'));
const NewDepositPage = lazy(() => import('pages/newDeposit'));
const NewWithdrawPage = lazy(() => import('pages/newWithdraw'));

const NewProposalPage = lazy(() => import('pages/newProposal'));
const ProposalPage = lazy(() => import('pages/proposal'));

const MintTokensProposalPage = lazy(() => import('pages/mintTokens'));
const ManageMembersProposalPage = lazy(() => import('pages/manageMembers'));

function App() {
  // TODO this needs to be inside a Routes component. Will be moved there with
  // further refactoring of layout (see further below).
  const {pathname} = useLocation();
  const {methods, status, network, address, provider} = useWallet();

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
            <Route path="/create" element={<CreateDAO />} />
          </Route>
          <Route path="/daos/:network/:dao">
            <Route element={<DaoWrapper />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="finance" element={<FinancePage />} />
              <Route path="finance/new-deposit" element={<NewDepositPage />} />
              <Route path="finance/tokens" element={<TokensPage />} />
              <Route path="finance/transfers" element={<TransfersPage />} />
              <Route element={<ProtectedRoute />}>
                <Route
                  path="finance/new-withdrawal"
                  element={<NewWithdrawPage />}
                />
                <Route
                  path="governance/new-proposal"
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
              <Route path="settings" element={<SettingsPage />} />
              {/* Redirects the user to the dashboard page by default if no dao-specific page is specified. */}
              <Route index element={<Navigate to={'dashboard'} replace />} />
            </Route>
          </Route>
          <Route path={NotFound} element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundWrapper />} />
        </Routes>
      </Suspense>
      <DaoSelectMenu />
      <WalletMenu />
      <NetworkErrorMenu />
    </>
  );
}

const NewSettingsWrapper: React.FC = () => {
  const formMethods = useForm({
    mode: 'onChange',
  });

  return (
    <FormProvider {...formMethods}>
      <Outlet />
    </FormProvider>
  );
};

const ProposalDetailsWrapper: React.FC = () => (
  <ProposalTransactionProvider>
    <ProposalPage />
  </ProposalTransactionProvider>
);

const NotFoundWrapper: React.FC = () => {
  const {pathname} = useLocation();

  return <Navigate to={NotFound} state={{incorrectPath: pathname}} replace />;
};

const ExploreWrapper: React.FC = () => (
  <>
    <ExploreNav />
    <Outlet />
    <Footer />
  </>
);

const DaoWrapper: React.FC = () => {
  const {dao} = useParams();
  const {data: daoDetails} = useDaoDetails(dao!);

  return (
    <>
      <Navbar />
      <div className="pb-15">
        <GridLayout>
          <Outlet />
          <TransferMenu />
          {daoDetails && (
            <TransactionDetail daoName={daoDetails.metadata.name} />
          )}
        </GridLayout>
      </div>
    </>
  );
};

export default App;
