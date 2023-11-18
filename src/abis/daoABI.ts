export const daoABI = [
  {inputs: [], stateMutability: 'nonpayable', type: 'constructor'},
  {
    inputs: [
      {internalType: 'address', name: '_where', type: 'address'},
      {internalType: 'address', name: '_who', type: 'address'},
      {internalType: 'bytes32', name: '_permissionId', type: 'bytes32'},
    ],
    name: 'grant',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {internalType: 'address', name: 'newImplementation', type: 'address'},
      {internalType: 'bytes', name: 'data', type: 'bytes'},
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {internalType: 'address', name: '_where', type: 'address'},
      {internalType: 'address', name: '_who', type: 'address'},
      {internalType: 'bytes32', name: '_permissionId', type: 'bytes32'},
    ],
    name: 'revoke',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {stateMutability: 'payable', type: 'receive'},
];
