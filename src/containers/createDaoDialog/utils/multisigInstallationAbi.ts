export const multisigInstallationAbi = [
  {name: 'members', type: 'address[]'},
  {
    name: 'multisigSettings',
    type: 'tuple',
    components: [
      {name: 'onlyListed', type: 'bool'},
      {name: 'minApprovals', type: 'uint16'},
    ],
  },
  {
    name: 'targetConfig',
    type: 'tuple',
    components: [
      {name: 'target', type: 'address'},
      {name: 'operation', type: 'uint8'},
    ],
  },
  {name: 'pluginMetadata', type: 'bytes'},
];
