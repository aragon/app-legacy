export const votesUpgradeableABI = [
  'function getPastTotalSupply(uint256 timepoint) external view returns (uint256)',
  'function getPastVotes(address account, uint256 timepoint) external view returns (uint256)',
  'function getVotes(address account) external view returns (uint256)',
  'function delegates(address account) external view returns (address)',
  'function delegate(address delegatee) external',
  'function delegateBySig(address delegatee, uint256 nonce, uint256 expiry, uint8 v, bytes32 r, bytes32 s) external',
  'event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate)',
  'event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance)',
];
