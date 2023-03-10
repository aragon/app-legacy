import {prefixProposalIdWithPlgnAdr} from 'utils/proposals';

const pluginAddress = '0xfee55b0ed94b71bbe42d19c79667039227abb28d';
const testCases = [
  {
    case: 'should prefix first proposal (0x00)',
    proposalId: '0x00', // coming from contracts
    expectedId: `${pluginAddress}_0x0`,
  },
  {
    case: 'should remove leading zeros from contract id',
    proposalId: '0x00003',
    expectedId: `${pluginAddress}_0x3`,
  },
  {
    case: 'should keep trailing zeros in contract id ',
    proposalId: '0x30',
    expectedId: `${pluginAddress}_0x30`,
  },
  {
    case: 'should prefix id without hex notation indicator (0x)',
    proposalId: '3',
    expectedId: `${pluginAddress}_0x3`,
  },
  {
    case: 'should convert raw string id to hexadecimal',
    proposalId: '11',
    expectedId: `${pluginAddress}_0xb`,
  },
  {
    case: 'should return proposal id already prefixed with plugin address unchanged',
    proposalId: `${pluginAddress}_0x1`,
    expectedId: `${pluginAddress}_0x1`,
  },
];

describe("Utility function 'prefixProposalIdWithPlgnAdr'", () => {
  testCases.forEach(tc => {
    test(tc.case, () => {
      const id = prefixProposalIdWithPlgnAdr(tc.proposalId, pluginAddress);

      expect(id).toBe(tc.expectedId);
    });
  });
});
