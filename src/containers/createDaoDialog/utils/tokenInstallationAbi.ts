export const tokenInstallationAbi = [
  {
    name: 'votingSettings',
    type: 'tuple',
    components: [
      {name: 'votingMode', type: 'uint8'},
      {name: 'supportThreshold', type: 'uint32'},
      {name: 'minParticipation', type: 'uint32'},
      {name: 'minDuration', type: 'uint64'},
      {name: 'minProposerVotingPower', type: 'uint256'},
    ],
  },
  {
    name: 'tokenSettings',
    type: 'tuple',
    components: [
      {name: 'addr', type: 'address'},
      {name: 'name', type: 'string'},
      {name: 'symbol', type: 'string'},
    ],
  },
  {
    name: 'mintSettings',
    type: 'tuple',
    components: [
      {name: 'receivers', type: 'address[]'},
      {name: 'amounts', type: 'uint256[]'},
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
  {name: 'minApprovals', type: 'uint256'},
  {name: 'pluginMetadata', type: 'bytes'},
];
