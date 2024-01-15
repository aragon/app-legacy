import {SupportedNetwork} from '@aragon/sdk-client-common';

const blockchainFilters = [
  {
    label: 'explore.modal.filterDAOs.label.ethereum',
    value: SupportedNetwork.MAINNET,
  },
  {
    label: 'explore.modal.filterDAOs.label.polygon',
    value: SupportedNetwork.POLYGON,
  },
  {
    label: 'explore.modal.filterDAOs.label.base',
    value: SupportedNetwork.BASE,
  },
  {
    label: 'explore.modal.filterDAOs.label.polygonMumbai',
    value: SupportedNetwork.MUMBAI,
    testnet: true,
  },
  {
    label: 'explore.modal.filterDAOs.label.baseGoerli',
    value: SupportedNetwork.BASE_GOERLI,
    testnet: true,
  },
];

const governanceFilters = [
  {label: 'explore.modal.filterDAOs.label.tokenVoting', value: 'token-based'},
  {label: 'explore.modal.filterDAOs.label.member', value: 'wallet-based'},
];

const quickFilters = [
  {label: 'explore.toggleFilter.allDAOs', value: 'allDaos'},
  {label: 'explore.toggleFilter.member', value: 'memberOf'},
  {label: 'explore.toggleFilter.Favourites', value: 'favourites'},
];

export {blockchainFilters, governanceFilters, quickFilters};
