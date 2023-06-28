export const ownableABI = [
  'function owner() view returns (address)',
  'function renounceOwnership()',
  'function transferOwnership(address newOwner)',
  'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
];
