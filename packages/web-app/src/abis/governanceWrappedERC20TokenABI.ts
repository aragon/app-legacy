export const governanceWrappedERC20TokenABI = [
  'function depositFor(address account, uint256 amount) external returns (bool)',
  'function withdrawTo(address account, uint256 amount) external returns (bool)',
];

export const erc20UpgradeableABI = [
  'function totalSupply() external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) external returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

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
