import {lazy} from 'react';

const ExplorePage = lazy(() =>
  import('pages/explore').then(module => ({default: module.Explore}))
);

const CreateDaoPage = lazy(() =>
  import('pages/createDAO').then(module => ({default: module.CreateDAO}))
);

const NotFoundPage = lazy(() =>
  import('pages/notFound').then(module => ({default: module.NotFound}))
);

const DashboardPage = lazy(() =>
  import('pages/dashboard').then(module => ({default: module.Dashboard}))
);
const FinancePage = lazy(() =>
  import('pages/finance').then(module => ({default: module.Finance}))
);
const GovernancePage = lazy(() =>
  import('pages/governance').then(module => ({default: module.Governance}))
);
const CommunityPage = lazy(() =>
  import('pages/community').then(module => ({default: module.Community}))
);

const SettingsPage = lazy(() =>
  import('pages/settings').then(module => ({default: module.Settings}))
);
const EditSettingsPage = lazy(() =>
  import('pages/editSettings').then(module => ({default: module.EditSettings}))
);
const ProposeSettingsPage = lazy(() =>
  import('pages/proposeSettings').then(module => ({
    default: module.ProposeSettings,
  }))
);

const TokensPage = lazy(() =>
  import('pages/tokens').then(module => ({default: module.Tokens}))
);
const TransfersPage = lazy(() =>
  import('pages/transfers').then(module => ({default: module.Transfers}))
);
const NewWithdrawPage = lazy(() =>
  import('pages/newWithdraw').then(module => ({default: module.NewWithdraw}))
);

const NewProposalPage = lazy(() =>
  import('pages/newProposal').then(module => ({default: module.NewProposal}))
);
const ProposalPage = lazy(() =>
  import('pages/proposal').then(module => ({default: module.Proposal}))
);

const MintTokensProposalPage = lazy(() =>
  import('pages/mintTokens').then(module => ({default: module.MintToken}))
);
const ManageMembersProposalPage = lazy(() =>
  import('pages/manageMembers').then(module => ({
    default: module.ManageMembers,
  }))
);

export const Pages = {
  ExplorePage,
  CreateDaoPage,
  NotFoundPage,
  DashboardPage,
  FinancePage,
  GovernancePage,
  CommunityPage,
  SettingsPage,
  EditSettingsPage,
  ProposeSettingsPage,
  TokensPage,
  TransfersPage,
  NewWithdrawPage,
  NewProposalPage,
  ProposalPage,
  MintTokensProposalPage,
  ManageMembersProposalPage,
};
