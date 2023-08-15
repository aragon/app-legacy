import React, {Suspense, useEffect} from 'react';
import {Navigate, Outlet, Route, useLocation} from 'react-router-dom';
import {ApmRoutes} from '@elastic/apm-rum-react';
import {GridLayout} from 'components/layout';
import ProtectedRoute from 'components/protectedRoute';
import {Loading} from 'components/temporary/loading';
import ExploreFooter from 'containers/exploreFooter';
import Footer from 'containers/footer';
import Navbar from 'containers/navbar';
import DaoSelectMenu from 'containers/navbar/daoSelectMenu';
import ExploreNav from 'containers/navbar/exploreNav';
import NetworkErrorMenu from 'containers/networkErrorMenu';
import TransactionDetail from 'containers/transactionDetail';
import TransferMenu from 'containers/transferMenu';
import {WalletMenu} from 'containers/walletMenu';
import {ProposalTransactionProvider} from 'context/proposalTransaction';
import {useTransactionDetailContext} from 'context/transactionDetail';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useWallet} from 'hooks/useWallet';
import {FormProvider, useForm} from 'react-hook-form';
import {identifyUser, trackPage} from 'services/analytics';
import {NotFound} from 'utils/paths';
import DepositModal from 'containers/transactionModals/depositModal';
import PoapClaimModal from 'containers/poapClaiming/PoapClaimModal';
import {GovTokensWrappingProvider} from 'context/govTokensWrapping';
import {featureFlags} from 'utils/featureFlags';
import {Pages} from 'pages';
import {useMonitoring} from 'hooks/useMonitoring';
import '../i18n.config';
import {ProposalSettingsFormData} from 'utils/types';

export const App: React.FC = () => {
  // TODO this needs to be inside a Routes component. Will be moved there with
  // further refactoring of layout (see further below).
  const {pathname} = useLocation();
  const {methods, status, network, address, provider} = useWallet();
  useMonitoring();

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
        <ApmRoutes>
          <Route element={<ExploreWrapper />}>
            <Route path="/" element={<Pages.ExplorePage />} />
          </Route>
          <Route element={<DaoWrapper />}>
            <Route path="/create" element={<Pages.CreateDaoPage />} />
          </Route>
          <Route path="/daos/:network/:dao">
            <Route element={<DaoWrapper />}>
              <Route path="dashboard" element={<Pages.DashboardPage />} />
              <Route path="finance" element={<Pages.FinancePage />} />
              <Route path="finance/tokens" element={<Pages.TokensPage />} />
              <Route
                path="finance/transfers"
                element={<Pages.TransfersPage />}
              />
              <Route element={<ProtectedRoute />}>
                <Route
                  path="finance/new-withdrawal"
                  element={<Pages.NewWithdrawPage />}
                />
                <Route
                  path="governance/new-proposal"
                  element={<Pages.NewProposalPage />}
                />
                <Route element={<NewSettingsWrapper />}>
                  <Route
                    path="settings/edit"
                    element={<Pages.EditSettingsPage />}
                  />
                  <Route
                    path="settings/new-proposal"
                    element={<Pages.ProposeSettingsPage />}
                  />
                </Route>
                <Route
                  path="community/mint-tokens"
                  element={<Pages.MintTokensProposalPage />}
                />
                <Route
                  path="community/manage-members"
                  element={<Pages.ManageMembersProposalPage />}
                />
              </Route>
              <Route path="governance" element={<Pages.GovernancePage />} />
              <Route
                path="governance/proposals/:id"
                element={<ProposalDetailsWrapper />}
              />
              <Route path="community" element={<Pages.CommunityPage />} />
              <Route path="settings" element={<Pages.SettingsPage />} />
              {/* Redirects the user to the dashboard page by default if no dao-specific page is specified. */}
              <Route index element={<Navigate to={'dashboard'} replace />} />
            </Route>
          </Route>
          <Route path={NotFound} element={<Pages.NotFoundPage />} />
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
        </ApmRoutes>
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
    },
  });

  return (
    <FormProvider {...formMethods}>
      <Outlet />
    </FormProvider>
  );
};

const ProposalDetailsWrapper: React.FC = () => (
  <ProposalTransactionProvider>
    <Pages.ProposalPage />
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
  const {data: daoDetails} = useDaoDetailsQuery();

  // using isOpen to conditionally render TransactionDetail so that
  // api call is not made on mount regardless of whether the user
  // wants to open the modal
  const {isOpen} = useTransactionDetailContext();

  return (
    <GovTokensWrappingProvider>
      <Navbar />
      <div className="min-h-screen">
        <GridLayout>
          <Outlet />
          <TransferMenu />
          <DepositModal />
          {daoDetails && isOpen && (
            <TransactionDetail
              daoAddress={daoDetails.address}
              daoEns={daoDetails.ensDomain}
              daoName={daoDetails.metadata.name}
              daoPlugin={daoDetails.plugins[0]}
            />
          )}
        </GridLayout>
      </div>
      <Footer />
    </GovTokensWrappingProvider>
  );
};
